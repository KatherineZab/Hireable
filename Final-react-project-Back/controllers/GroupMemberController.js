import Group from '../models/Group.js';
import UserInfo from '../models/UserInfo.js';
import mongoose from 'mongoose';

// Approve join request
export const approveJoinRequest = async (req, res) => { // יוזר שצריך לאשר

    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // להסיר מרשימת ממתינים ולהעביר לחברים של הקבוצה 
        group.pendingRequests = group.pendingRequests.filter(req => req.userId.toString() !== userId);
        if (!group.members.includes(userId)) group.members.push(userId);
        group.memberCount = group.members.length;
        await group.save();

        // להכניס את מזהה הקבוצה לרשימת הקבוצות של היוזר אם הוא לא חבר בה
        const userInfo = await UserInfo.findOne({ userId });
        if (userInfo && !userInfo.followingGroups.includes(group._id)) {
            userInfo.followingGroups.push(group._id);
            await userInfo.save();
        }

        res.json({ message: 'User approved and added to group' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// דחיית בקשה
export const rejectJoinRequest = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // הסרה מפנדינג
        group.pendingRequests = group.pendingRequests.filter(req => req.userId.toString() !== userId);
        await group.save();
        res.json({ message: 'User request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST join group
export const joinGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // האם היוזר כבר חבר בקבוצה 
        if (userId && group.members.some(member => member.toString() === userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }
        
        // הכנס למערך חברים 
        if (userId) {
            group.members.push(userId);
        }
        
        // עדכון מונה חברים בקבוצה
        group.memberCount = group.members.length;
        await group.save();

        // הוסף את מזהה הקבוצה לרשימת של הקבוצות של היוזר
        const userInfo = await UserInfo.findOne({ userId });
        if (userInfo && !userInfo.followingGroups.includes(group._id)) {
            userInfo.followingGroups.push(group._id);
            await userInfo.save();
        }
        
        // תחזיר את הקבוצה המעודכנת 
        const updatedGroup = await Group.findById(groupId)
            .populate('creator', 'name')
            .populate('members', 'name');
        
        res.json({ 
            message: 'Successfully joined group', 
            group: updatedGroup 
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST עזיבת קבוצת 
export const leaveGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // בדוק אם המשתמש חבר בה
        if (userId && !group.members.some(member => member.toString() === userId)) {
            return res.status(400).json({ message: 'You are not a member of this group' });
        }
        
        // הסר את היוזר מרשימת החברים
        if (userId) {
            group.members = group.members.filter(memberId => memberId.toString() !== userId);
        }
        
        // תעדכן את המונה
        group.memberCount = group.members.length;
        await group.save();

        // הסר את מזהה הקבוצה מהקבוצה שעוקב אחריה 
        const userInfo = await UserInfo.findOne({ userId });
        if (userInfo && userInfo.followingGroups.includes(group._id)) {
            userInfo.followingGroups = userInfo.followingGroups.filter(gid => gid.toString() !== group._id.toString());
            await userInfo.save();
        }
        
        // תחזיר את הקבוצה המעודכנת 
        const updatedGroup = await Group.findById(groupId)
            .populate('creator', 'name')
            .populate('members', 'name');
        
        res.json({ 
            message: 'Successfully left group', 
            group: updatedGroup 
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ message: error.message });
    }
};

        // בקשת הצטרפות לקבוצה פרטית
export const requestJoinGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // בודק האם היוזר חבר כעת 
        if (userId && group.members.some(member => member.toString() === userId)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }
        
        // בדוק אם היוזר כבר ביקש להצטרף
        const existingRequest = group.pendingRequests && group.pendingRequests.find(
            req => req.userId.toString() === userId
        );
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this group' });
        }
        
        // הוסף למערך בקשות בהמתנה
        if (!group.pendingRequests) group.pendingRequests = [];
        group.pendingRequests.push({
            userId,
            requestedAt: new Date()
        });
        
        await group.save();
        
        // תעדכן פרטי קבוצה 
        const updatedGroup = await Group.findById(groupId)
            .populate('pendingRequests.userId', 'name email profilePicture');
            
        res.json({ 
            message: 'Join request sent successfully',
            group: updatedGroup
        });
    } catch (error) {
        console.error('Request join group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST ביטול בקשת הצטרפות
export const cancelJoinRequest = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { userId } = req.body;
        
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // להסיר ממערך מבקשי ההצטרפות
        if (group.pendingRequests) {
            group.pendingRequests = group.pendingRequests.filter(
                req => req.userId.toString() !== userId
            );
        }
        
        await group.save();
        
        res.json({ message: 'Join request canceled successfully' });
    } catch (error) {
        console.error('Cancel join request error:', error);
        res.status(500).json({ message: error.message });
    }
};


// GET all members of a group (for the dropdown)
export const getGroupMembers = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const requestingUserId = req.query.userId;
        
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: 'Invalid group ID format' });
        }

        const group = await Group.findById(groupId)
            .populate('members', 'name email')
            .populate('creator', 'name email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check privacy for private groups
        if (group.isPrivate && requestingUserId) {
            const isMember = group.members.some(member => member._id.toString() === requestingUserId);
            const isCreator = group.creator && group.creator._id.toString() === requestingUserId;
            
            if (!isMember && !isCreator) {
                return res.status(403).json({ 
                    message: 'Cannot view members of private group',
                    isPrivate: true 
                });
            }
        }

        const memberIds = [...group.members.map(m => m._id.toString())];
        if (group.creator && !memberIds.includes(group.creator._id.toString())) {
            memberIds.push(group.creator._id.toString());
        }

        const userInfos = await UserInfo.find({ userId: { $in: memberIds } });
        const userInfoMap = {};
        userInfos.forEach(info => {
            userInfoMap[info.userId.toString()] = info;
        });

        const enrichedMembers = group.members.map(member => {
            const info = userInfoMap[member._id.toString()];
            const firstName = info?.first_name || '';
            const lastName = info?.last_name || '';
            const displayName = (firstName || lastName) 
                ? `${firstName} ${lastName}`.trim() 
                : member.name || member.email || 'Unknown User';
            
            return {
                _id: member._id,
                email: member.email,
                name: member.name,
                displayName,
                profilePicture: info?.profilePicture || '',
                first_name: firstName,
                last_name: lastName,
                isCreator: group.creator && member._id.equals(group.creator._id)
            };
        });

        if (group.creator && !group.members.some(m => m._id.equals(group.creator._id))) {
            const creatorInfo = userInfoMap[group.creator._id.toString()];
            const firstName = creatorInfo?.first_name || '';
            const lastName = creatorInfo?.last_name || '';
            const displayName = (firstName || lastName) 
                ? `${firstName} ${lastName}`.trim() 
                : group.creator.name || group.creator.email || 'Unknown User';
            
            enrichedMembers.unshift({
                _id: group.creator._id,
                email: group.creator.email,
                name: group.creator.name,
                displayName,
                profilePicture: creatorInfo?.profilePicture || '',
                first_name: firstName,
                last_name: lastName,
                isCreator: true
            });
        }

        res.json({
            groupId: group._id,
            groupName: group.name,
            totalMembers: enrichedMembers.length,
            members: enrichedMembers,
            creatorId: group.creator?._id,
            isPrivate: group.isPrivate
        });

    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ message: error.message });
    }
};

// הסרת משתמש- רק האדמין יכול 
export const removeMember = async (req, res) => {
    try {
        const { groupId, userId: memberToRemove } = req.params;
        const { userId: requestingUserId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(groupId) || 
            !mongoose.Types.ObjectId.isValid(memberToRemove)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.creator || !group.creator.equals(requestingUserId)) {
            return res.status(403).json({ message: 'Only the group creator can remove members' });
        }

        if (group.creator.equals(memberToRemove)) {
            return res.status(400).json({ message: 'Group creator cannot be removed. Transfer ownership first.' });
        }

        if (!group.members.some(memberId => memberId.equals(memberToRemove))) {
            return res.status(400).json({ message: 'User is not a member of this group' });
        }

        group.members = group.members.filter(memberId => !memberId.equals(memberToRemove));
        group.memberCount = group.members.length;
        
        await group.save();

        // להסיר את מזהה הקבוצה מתוך מערך הקבוצות שלו 
        const userInfo = await UserInfo.findOne({ userId: memberToRemove });
        if (userInfo && userInfo.followingGroups.includes(group._id)) {
            userInfo.followingGroups = userInfo.followingGroups.filter(gid => gid.toString() !== group._id.toString());
            await userInfo.save();
        }
        // החזר את הקבוצה המעודכנת 

        const updatedGroup = await Group.findById(groupId)
            .populate('members', 'name email')
            .populate('creator', 'name email');

        res.json({ 
            message: 'Member removed successfully',
            group: updatedGroup,
            removedMemberId: memberToRemove
        });

    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ message: error.message });
    }
};