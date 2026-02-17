import React from "react";
import { Flex, Modal } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import styles from "./index.module.css";

type SuccessModalProps = {
    open: boolean
    title?: string
    message?: string
    dashboardButtonText?: string
    eventOverviewButtonText?: string
    onDashboardClick: () => void
    onEventOverviewClick: () => void
}

export default function SuccessModal({
    open,
    title = "Event Form Submitted for Review!",
    message = "Your event form has been successfully submitted and is now under review. You can view the event details or return to your dashboard.",
    dashboardButtonText = "Go to Dashboard",
    eventOverviewButtonText = "View Event Overview",
    onDashboardClick,
    onEventOverviewClick
}: SuccessModalProps) {
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
            <div className={styles.container}>
                <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '1.375rem' }} className={styles.icon} />
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
                        style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                        <Button
                            type="default"
                            size="large"
                            onClick={onDashboardClick}
                        >
                            {dashboardButtonText}
                        </Button>

                        <Button
                            type="primary"
                            size="large"
                            onClick={onEventOverviewClick}
                        >
                            {eventOverviewButtonText}
                        </Button>
                    </Space>
                </div>


            </div>
        </Modal>
    )
}
