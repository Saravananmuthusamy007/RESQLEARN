import Certificate from '../models/Certificate.js';
import Mastery from '../models/Mastery.js';
import { issueCertificateForLearner, verifyCertificateById } from '../services/certification/certificateService.js';

// @desc    Get certificate for currently authenticated learner
// @route   GET /api/certificate
// @access  Private
export const getMyCertificate = async (req, res) => {
  try {
    let certificate = await Certificate.findOne({ learner: req.user._id });

    // If no certificate exists yet, check if all 5 levels are completed and auto-issue
    if (!certificate) {
      const completedMasteries = await Mastery.find({ learner: req.user._id, status: 'completed' });
      const completedLevelNums = completedMasteries.map(m => m.levelNumber);

      const isEligible = [1, 2, 3, 4, 5].every(lvl => completedLevelNums.includes(lvl));

      if (isEligible) {
        certificate = await issueCertificateForLearner(req.user._id);
      } else {
        return res.json({
          success: true,
          isEligible: false,
          completedCount: completedLevelNums.length,
          completedLevels: completedLevelNums,
          remainingLevels: [1, 2, 3, 4, 5].filter(l => !completedLevelNums.includes(l)),
          certificate: null,
          message: `Complete all 5 emergency training levels to unlock your certification. (${completedLevelNums.length}/5 completed)`,
        });
      }
    }

    res.json({
      success: true,
      isEligible: true,
      certificate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching certificate.',
    });
  }
};

// @desc    Public verification of a certificate by unique ID
// @route   GET /api/certificate/verify/:certificateId
// @access  Public
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId || certificateId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Certificate ID.',
      });
    }

    const verificationResult = await verifyCertificateById(certificateId.trim().toUpperCase());

    if (!verificationResult.isValid) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: verificationResult.reason,
      });
    }

    res.json({
      success: true,
      isValid: true,
      certificate: verificationResult.certificate,
      message: 'Certificate authenticity verified via SHA-256 cryptographic check.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error verifying certificate.',
    });
  }
};

export default {
  getMyCertificate,
  verifyCertificate,
};
