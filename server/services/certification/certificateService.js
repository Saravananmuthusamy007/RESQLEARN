import crypto from 'crypto';
import Certificate from '../../models/Certificate.js';
import Mastery from '../../models/Mastery.js';
import User from '../../models/User.js';

// Secret salt for tamper-evident HMAC/SHA-256 hashing
const CERTIFICATE_SECRET_SALT = process.env.CERTIFICATE_SALT || 'resqlearn_clinical_tamper_evident_salt_2026';

/**
 * Generate canonical string payload for deterministic SHA-256 hashing
 */
export function createCanonicalCertificatePayload({
  learnerId,
  certificateId,
  overallScore,
  completedLevels = [],
  completionDate,
}) {
  const sortedLevels = [...completedLevels].sort((a, b) => a - b).join(',');
  const isoDate = new Date(completionDate).toISOString().split('T')[0]; // Format YYYY-MM-DD for canonical stability
  return `RESQLEARN-CERT|${learnerId}|${certificateId}|${Number(overallScore).toFixed(2)}|[${sortedLevels}]|${isoDate}|${CERTIFICATE_SECRET_SALT}`;
}

/**
 * Compute SHA-256 hash
 */
export function computeCertificateHash(canonicalPayload) {
  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

/**
 * Issue a verified certificate for a learner who completed all 5 levels
 */
export async function issueCertificateForLearner(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('Learner not found');

  // Verify all 5 levels are completed
  const masteries = await Mastery.find({ learner: userId, status: 'completed' });
  const completedLevelNumbers = masteries.map(m => m.levelNumber).sort((a, b) => a - b);

  const requiredLevels = [1, 2, 3, 4, 5];
  const hasAllFive = requiredLevels.every(lvl => completedLevelNumbers.includes(lvl));

  if (!hasAllFive) {
    throw new Error(`Learner has completed [${completedLevelNumbers.join(', ')}]. All 5 levels must be completed before certification.`);
  }

  // Check if certificate already exists
  const existingCert = await Certificate.findOne({ learner: userId });
  if (existingCert) {
    return existingCert;
  }

  // Calculate overall score (average of practical and assessment scores across all 5 levels)
  const totalScoreSum = masteries.reduce((sum, m) => sum + ((m.practicalScore + m.assessmentScore) / 2), 0);
  const overallScore = Math.round((totalScoreSum / masteries.length) * 100) / 100;

  // Generate unique certificate ID: RESQ-YYYY-RANDOMHEX
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  const certificateId = `RESQ-${year}-${randomSuffix}`;
  const completionDate = new Date();

  // Compute canonical SHA-256 hash
  const canonicalPayload = createCanonicalCertificatePayload({
    learnerId: user._id.toString(),
    certificateId,
    overallScore,
    completedLevels: completedLevelNumbers,
    completionDate,
  });
  const sha256Hash = computeCertificateHash(canonicalPayload);

  const newCertificate = await Certificate.create({
    learner: user._id,
    learnerName: user.name,
    certificateId,
    title: 'First-Aid & Basic Life Support (BLS) Clinical Competency',
    overallScore,
    completedLevels: completedLevelNumbers,
    completionDate,
    sha256Hash,
    verificationStatus: 'VALID',
    issuer: 'ResqLearn Emergency Medical Training Authority',
  });

  return newCertificate;
}

/**
 * Verify certificate authenticity against stored data and recomputed SHA-256 hash
 */
export async function verifyCertificateById(certificateId) {
  const certificate = await Certificate.findOne({ certificateId }).populate('learner', 'name email');
  if (!certificate) {
    return {
      isValid: false,
      reason: 'Certificate ID not found in ResqLearn verification registry.',
      certificate: null,
    };
  }

  // Re-compute canonical hash
  const canonicalPayload = createCanonicalCertificatePayload({
    learnerId: certificate.learner._id ? certificate.learner._id.toString() : certificate.learner.toString(),
    certificateId: certificate.certificateId,
    overallScore: certificate.overallScore,
    completedLevels: certificate.completedLevels,
    completionDate: certificate.completionDate,
  });

  const recomputedHash = computeCertificateHash(canonicalPayload);

  const isTamperFree = crypto.timingSafeEqual(
    Buffer.from(certificate.sha256Hash, 'hex'),
    Buffer.from(recomputedHash, 'hex')
  );

  if (!isTamperFree) {
    return {
      isValid: false,
      reason: 'Cryptographic hash mismatch. Certificate data has been altered or tampered with.',
      certificate: null,
    };
  }

  if (certificate.verificationStatus !== 'VALID') {
    return {
      isValid: false,
      reason: `Certificate status is ${certificate.verificationStatus}.`,
      certificate: null,
    };
  }

  return {
    isValid: true,
    certificate: {
      certificateId: certificate.certificateId,
      learnerName: certificate.learnerName,
      title: certificate.title,
      overallScore: certificate.overallScore,
      completedLevels: certificate.completedLevels,
      completionDate: certificate.completionDate,
      sha256Hash: certificate.sha256Hash,
      verificationStatus: certificate.verificationStatus,
      issuer: certificate.issuer,
    }
  };
}

export default {
  createCanonicalCertificatePayload,
  computeCertificateHash,
  issueCertificateForLearner,
  verifyCertificateById,
};
