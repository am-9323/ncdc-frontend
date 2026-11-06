import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Content } from '@/features/content/types'

export const contentKeys = {
  all: ['contents'] as const,
}

export const getContents = async (): Promise<Content[]> => {
  const contents = await apiClient.get<Content[]>('/content')
  return (contents ?? []).toSorted((a, b) => a.id - b.id)
}

export const useContents = () =>
  useQuery({
    queryKey: contentKeys.all,
    queryFn: getContents,
  })
