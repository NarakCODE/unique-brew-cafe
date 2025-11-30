import express, { Router } from 'express';
import {
  search,
  getSuggestions,
  getRecentSearches,
  deleteAllSearches,
  deleteSearch,
} from '../controllers/searchController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  searchQuerySchema,
  searchSuggestionsSchema,
  deleteSearchSchema,
} from '../schemas/index.js';

const router: Router = express.Router();

/**
 * Public search endpoint
 * GET /search?query=coffee&type=all
 */
router.get('/', validate(searchQuerySchema), search);

/**
 * Get autocomplete suggestions
 * GET /search/suggestions?query=cof
 */
router.get('/suggestions', validate(searchSuggestionsSchema), getSuggestions);

/**
 * Get user's recent searches (authenticated)
 * GET /search/recent
 */
router.get('/recent', authenticate, getRecentSearches);

/**
 * Delete all recent searches (authenticated)
 * DELETE /search/recent
 */
router.delete('/recent', authenticate, deleteAllSearches);

/**
 * Delete a specific search from history (authenticated)
 * DELETE /search/recent/:searchId
 */
router.delete(
  '/recent/:searchId',
  authenticate,
  validate(deleteSearchSchema),
  deleteSearch
);

export default router;
