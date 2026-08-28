// simulationApi.js - API service for submitting and fetching practical simulation attempt data

import api from './api';

export const submitPracticalAttempt = async (levelId, attemptData) => {
  const response = await api.post(`/practical/${levelId}/attempt`, attemptData);
  return response.data;
};

export const getPracticalAttemptHistory = async (levelId) => {
  const response = await api.get(`/practical/${levelId}/attempts`);
  return response.data;
};

export const getLevelDetails = async (levelId) => {
  const response = await api.get(`/levels/${levelId}`);
  return response.data;
};
