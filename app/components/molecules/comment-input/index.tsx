import React, { useState } from 'react';
import { Input, Button, Avatar, Badge, Divider } from 'antd';
import { UserOutlined, LikeOutlined, DislikeOutlined, FilterOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const { TextArea } = Input;
const MAX = 100;

const CommentInput: React.FC = () => {
    const [value, setValue] = useState('');

    return (
    <>
        {/* Comment Input */}
        <div className={styles.wrapper}>
            <Avatar icon={<UserOutlined />} className={styles.avatar} />
            <div className={styles.inputWrapper}>
                <TextArea
                    rows={3}
                    placeholder="Leave a comment..."
                    className={styles.textarea}
                    value={value}
                    maxLength={MAX}
                    onChange={e => setValue(e.target.value)}
                />
                <div className={styles.footer}>
                    <Button type="primary" className={styles.btn}>Comment</Button>
                    <span className={styles.charCount}>{value.length}/{MAX}</span>
                </div>
            </div>
        </div>
    <Divider />
        <div className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
                <div className={styles.commentsLabel}>
                    <span className={styles.commentsTitle}>Comments</span>
                    <Badge count={1} style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--primary)' }} />
                </div>
                <Button icon={<FilterOutlined />}>Sort By</Button>
            </div>
            <div className={styles.comment}>
                <Avatar icon={<UserOutlined />} className={styles.avatar} />
                <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                        <span className={styles.commentName}>Jane Doe</span>
                        <span className={styles.commentTime}>2 days ago</span>
                    </div>
                    <p className={styles.commentText}>
                        The time and room that you booked will be occupied by an open-house event. Please make changes accordingly.
                    </p>
                    <div className={styles.commentActions}>
                        <Button type="text" icon={<LikeOutlined />} size="small">3</Button>
                        <Button type="text" icon={<DislikeOutlined />} size="small">0</Button>
                        <Button type="link" size="small">Reply</Button>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default CommentInput;