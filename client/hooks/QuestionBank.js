import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

export function useQuestionBank({ token, existingIds = [] }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [adding, setAdding] = useState(false);

  const existingIdSet = useMemo(
    () => new Set(existingIds),
    [existingIds]
  );

  const load = useCallback(async () => {
    try {
      const result = await api.get('/questions', token);
      setQuestions(result ?? []);
    } catch (error) {
      console.warn('QuestionBank load error:', error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const allTags = useMemo(() => {
    const seen = new Set();
    const result = [];

    questions.forEach(question => {
      (question.tags ?? []).forEach(tag => {
        if (!seen.has(tag.name)) {
          seen.add(tag.name);
          result.push(tag);
        }
      });
    });

    return result;
  }, [questions]);

  const toggleTag = useCallback((name) => {
    setActiveTags(current =>
      current.includes(name)
        ? current.filter(tag => tag !== name)
        : [...current, name]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags([]);
    setQuery('');
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds(current => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const filteredQuestions = useMemo(() => {
    const search = query.trim().toLowerCase();

    return questions.filter(question => {
      const content =
        typeof question.content === 'string'
          ? question.content.toLowerCase()
          : '';

      const matchesText =
        !search ||
        content.includes(search) ||
        (question.tags ?? []).some(tag =>
          String(tag.name).toLowerCase().includes(search)
        );

      const matchesTags =
        activeTags.length === 0 ||
        activeTags.every(activeTag =>
          (question.tags ?? []).some(tag => tag.name === activeTag)
        );

      return matchesText && matchesTags;
    });
  }, [questions, query, activeTags]);

  return {
    questions,
    setQuestions,
    loading,
    setLoading,
    refreshing,
    setRefreshing,
    query,
    setQuery,
    activeTags,
    selectedIds,
    adding,
    setAdding,
    allTags,
    existingIdSet,
    filteredQuestions,
    onRefresh,
    toggleTag,
    clearFilters,
    toggleSelect,
  };
}

