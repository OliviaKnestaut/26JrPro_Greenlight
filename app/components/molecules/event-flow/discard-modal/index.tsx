import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import styles from "./index.module.css";

type DiscardModalProps = {
    open: boolean
    title?: string
    message?: string
    discardButtonText?: string
    cancelButtonText?: string
    onDiscardClick: () => void
    onCancelClick: () => void
}

export default function DiscardModal({
    open,
    title = "Discard Event Form?",
    message = "Any unsaved changes will be lost. Are you sure you want to discard this event form?",
    cancelButtonText = "Cancel",
    discardButtonText = "Discard",
    onDiscardClick,
    onCancelClick
}: DiscardModalProps) {
    const content = (
        <div className={styles.container}>
            <ExclamationCircleOutlined style={{ color: 'var(--gold-6)', fontSize: '1.375rem' }} className={styles.icon} />
            <div className={styles.content}>
                <div className={styles.header}>
                    <h5>
                        {title}
                    </h5>
                    <p className={styles.message}>
                        {message}
                    </p>
                </div>
                <Space
                    className={styles.buttonGroup}
                    size="middle"
                    style={{ width: "100%", justifyContent: "flex-end" }}
                >
                    <Button
                        type="default"
                        size="large"
                        onClick={onCancelClick}
                    >
                        {cancelButtonText}
                    </Button>

                    <Button
                        type="primary"
                        size="large"
                        onClick={onDiscardClick}
                    >
                        {discardButtonText}
                    </Button>
                </Space>
            </div>
        </div>
    );

    return (
        <Modal
            open={open}
            footer={null}
            centered
            closable={false}
            maskClosable={false}
            classNames={{
                content: styles.modalContent
            }}
        >
            {content}
        </Modal>
    );
}