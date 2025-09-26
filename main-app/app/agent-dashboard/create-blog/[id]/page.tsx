import { getEditBlog } from '@/app/action/blog-actions';
import { getCurrentUser } from '@/app/action/user-actions';
import EditBlogClient, { BlogPost } from '@/components/pages/create-blog/edit-blog-client';
import { userProps } from '@/lib/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Edit Blog',
};

interface PageProps {
  params: { id: string };
}

const EditBlogPage = async ({ params }: PageProps) => {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    redirect('/agent-dashboard');
  }

  try {
    const [current_user, currentBlog] = await Promise.all([
      getCurrentUser() as Promise<userProps | null>,
      getEditBlog(id) as Promise<BlogPost | null>,
    ]);

    if (!current_user) {
      redirect('/');
    }

    if (!currentBlog) {
      redirect(`/${current_user.role}-dashboard`);
    };

    return <EditBlogClient blog={currentBlog} user={current_user} />;
  } catch (error) {
    console.error('Error in EditBlogPage:', error);
    redirect('/agent-dashboard');
  }
};

export default EditBlogPage;