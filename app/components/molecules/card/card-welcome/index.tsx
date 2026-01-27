import React from "react";
import { Card, Button, Typography } from "antd";
import styles from "./index.module.css";
import { useNavigate } from "react-router";


export type CardWelcomeProps = React.ComponentProps<typeof Card> & {
    subtitle?: React.ReactNode;
};

const { Title, Text } = Typography;

const CardWelcome: React.FC<CardWelcomeProps> = ({
    children,
    title,
    subtitle,
    ...rest
}) => {
    const navigate = useNavigate();

    return (
        <Card
        bodyStyle={{ padding: 0 }}
        className={styles.card}
        {...rest}
        >
        {/* Header */}
        <div className={styles.header}>
            {title && (
            <Title level={2} className={styles.title}>
                {title}
            </Title>
            )}

            {subtitle && (
            <Text className={styles.subtitle}>{subtitle}</Text>
            )}
        </div>

        {/* Content and buttons */}
        <div className={styles.content}>
            <div className={styles.childrenWrapper}>{children}</div>

            <div className={styles.actions}>
            <Button type="primary" className={styles.btn} onClick={() => navigate('/event-form')}>
                New Event
            </Button>
            <Button className={styles.btn}>
                New Brainstorm
            </Button>
            </div>
        </div>
        </Card>
    );
};

export default CardWelcome;
