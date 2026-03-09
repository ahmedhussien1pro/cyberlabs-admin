import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FlaskConical,
  Users,
  Route,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  {
    label: 'New Course',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'hover:bg-blue-50 dark:hover:bg-blue-950/40',
    to: '/courses/new',
  },
  {
    label: 'New Lab',
    icon: FlaskConical,
    color: 'text-purple-500',
    bg: 'hover:bg-purple-50 dark:hover:bg-purple-950/40',
    to: '/labs/new',
  },
  {
    label: 'New Path',
    icon: Route,
    color: 'text-green-500',
    bg: 'hover:bg-green-50 dark:hover:bg-green-950/40',
    to: '/paths/new',
  },
  {
    label: 'Manage Users',
    icon: Users,
    color: 'text-orange-500',
    bg: 'hover:bg-orange-50 dark:hover:bg-orange-950/40',
    to: '/users',
  },
] as const;

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base flex items-center gap-2'>
          <Zap className='h-4 w-4 text-yellow-500' />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-2'>
          {ACTIONS.map(({ label, icon: Icon, color, bg, to }) => (
            <Button
              key={label}
              variant='outline'
              size='sm'
              className={`gap-2 transition-all ${bg}`}
              onClick={() => navigate(to)}
            >
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
