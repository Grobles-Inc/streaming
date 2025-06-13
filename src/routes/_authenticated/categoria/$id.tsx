import Category from '@/features/home/category';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/categoria/$id')({
  loader: async ({ params }: { params: { categoryId: string } }) => {
    return {
      categoryId: params.categoryId,
    };
  },
  component: () => <Category />,
})
