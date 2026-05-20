import type { CarouselPost } from '../types';

export interface PreviewTodoItem {
  id: string;
  text: string;
  isDone: boolean;
  emphasize?: boolean;
  editing?: boolean;
  actionLabel?: string;
}

export const GUEST_TODO_PREVIEW: {
  todo: PreviewTodoItem[];
  done: PreviewTodoItem[];
} = {
  todo: [
    { id: 'guest-todo-1', text: 'this is a new task', isDone: true, emphasize: true },
    { id: 'guest-todo-2', text: 'Develop the To-do list page', isDone: false },
    { id: 'guest-todo-3', text: 'Create the drag-and-drop function', isDone: false },
    { id: 'guest-todo-4', text: 'Add new tasks', isDone: false },
    { id: 'guest-todo-5', text: 'Delete items', isDone: false },
    { id: 'guest-todo-6', text: 'Erase all', isDone: false },
    { id: 'guest-todo-7', text: 'Checked item goes to Done list', isDone: false },
    { id: 'guest-todo-8', text: 'This item label may be edited', isDone: false, actionLabel: 'delete' },
    { id: 'guest-todo-9', text: 'Editing an item...', isDone: false, editing: true },
  ],
  done: [
    { id: 'guest-done-1', text: 'Get FTP credentials', isDone: true, actionLabel: 'delete' },
    { id: 'guest-done-2', text: 'Home Page Design', isDone: true },
    { id: 'guest-done-3', text: 'E-mail John about the deadline', isDone: true },
    { id: 'guest-done-4', text: 'Create a Google Drive folder', isDone: true },
    { id: 'guest-done-5', text: 'Send a gift to the client', isDone: true },
  ],
};

export const GOOD_THINGS_POSTS: CarouselPost[] = [
  {
    id: 'good-things-1',
    title: 'Organize your daily job enhance your life performance',
    body: 'Organize your daily job enhance your life performance',
    imageUrl: '/images/two_persons_image.png',
    imageAlt: 'Duas pessoas olhando para um notebook e colaborando em uma tarefa',
    position: 1,
  },
  {
    id: 'good-things-2',
    title: 'Mark one activity as done makes your brain understands the power of doing.',
    body: 'Mark one activity as done makes your brain understands the power of doing.',
    imageUrl: '/images/one_person_image.avif',
    imageAlt: 'Pessoa pintando em um atelie com quadros ao fundo',
    position: 2,
  },
  {
    id: 'good-things-3',
    title: 'Careful with misunderstanding the difference between a list of things and a list of desires.',
    body: 'Careful with misunderstanding the difference between a list of things and a list of desires.',
    imageUrl: '/images/hand_tissue_image.avif',
    imageAlt: 'Mao costurando tecido em uma maquina de costura',
    position: 3,
  },
  {
    id: 'good-things-4',
    title: 'Organize your daily job enhance your life performance',
    body: 'Organize your daily job enhance your life performance',
    imageUrl: '/images/two_persons_image.png',
    imageAlt: 'Duas pessoas olhando para um notebook e colaborando em uma tarefa',
    position: 4,
  },
  {
    id: 'good-things-5',
    title: 'Mark one activity as done makes your brain understands the power of doing.',
    body: 'Mark one activity as done makes your brain understands the power of doing.',
    imageUrl: '/images/one_person_image.avif',
    imageAlt: 'Pessoa pintando em um atelie com quadros ao fundo',
    position: 5,
  },
  {
    id: 'good-things-6',
    title: 'Careful with misunderstanding the difference between a list of things and a list of desires.',
    body: 'Careful with misunderstanding the difference between a list of things and a list of desires.',
    imageUrl: '/images/hand_tissue_image.avif',
    imageAlt: 'Mao costurando tecido em uma maquina de costura',
    position: 6,
  },
];