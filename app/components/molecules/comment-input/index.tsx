import React, { useState } from 'react';
import { Input, Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const { TextArea } = Input;
const MAX = 100;

const CommentInput: React.FC = () => {
    const [value, setValue] = useState('');

    return (
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
                    <Button type="primary">Comment</Button>
                    <span className={styles.charCount}>{value.length}/{MAX}</span>
                </div>
            </div>
        </div>
    );
};

export default CommentInput;