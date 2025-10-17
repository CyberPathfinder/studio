'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/firebase';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';

const ProfileCard = ({ user }: { user: User }) => {
  const auth = useAuth();
  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.displayName || 'Wellness Seeker'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
