
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin, BlockedUser } from '@/hooks/useAdmin';
import { UserX, Shield, Users } from 'lucide-react';
import { format } from 'date-fns';

const UserManagement = () => {
  const { blockUser, unblockUser, fetchBlockedUsers } = useAdmin();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [userToBlock, setUserToBlock] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setLoading(true);
    const users = await fetchBlockedUsers();
    setBlockedUsers(users);
    setLoading(false);
  };

  const handleBlockClick = (userId: string) => {
    setUserToBlock(userId);
    setShowBlockDialog(true);
  };

  const handleBlockConfirm = async () => {
    if (userToBlock && blockReason.trim()) {
      const success = await blockUser(userToBlock, blockReason);
      if (success) {
        setShowBlockDialog(false);
        setBlockReason('');
        setUserToBlock(null);
        await loadBlockedUsers();
      }
    }
  };

  const handleUnblock = async (userId: string) => {
    const success = await unblockUser(userId);
    if (success) {
      await loadBlockedUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Blocked Users ({blockedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No blocked users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-gray-500">{user.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate">{user.reason}</p>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.blockedAt), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">Blocked</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblock(user.userId)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block User Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please provide a reason for blocking this user.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Reason (required)
              </label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this user..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBlockDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBlockConfirm}
                disabled={!blockReason.trim()}
              >
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
