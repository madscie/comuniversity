import { useState, useEffect, useCallback } from "react";

export const useApi = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...params) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...params);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
};

export const useBooks = (params = {}, immediate = true) => {
  return useApi(async () => {
    const response = await bookService.getBooks(params);
    return response.data;
  }, immediate);
};

export const useBook = (id, immediate = true) => {
  return useApi(async () => {
    const response = await bookService.getBookById(id);
    return response.data;
  }, immediate);
};

export const useArticles = (params = {}, immediate = true) => {
  return useApi(async () => {
    const response = await articleService.getArticles(params);
    return response.data;
  }, immediate);
};
