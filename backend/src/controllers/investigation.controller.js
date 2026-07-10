import investigationService from '../services/investigation.service.js';
import { successResponse } from '../utils/responseFormatter.js';

export const submitAction = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId, type, target, content } = req.body;
    const result = await investigationService.submitAction(code, playerId, { type, target, content });
    successResponse(res, result, 'Action processed successfully');
  } catch (error) {
    next(error);
  }
};

export const getLogs = async (req, res, next) => {
  try {
    const { code } = req.params;
    const logs = await investigationService.getLogs(code);
    successResponse(res, { logs });
  } catch (error) {
    next(error);
  }
};

export const startVoting = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = await investigationService.startVoting(code, playerId);
    successResponse(res, result, 'Voting phase started successfully');
  } catch (error) {
    next(error);
  }
};

export const castVote = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId, suspectName } = req.body;
    const result = await investigationService.castVote(code, playerId, suspectName);
    successResponse(res, result, 'Vote cast successfully');
  } catch (error) {
    next(error);
  }
};
