import React from "react";
import { Steps } from "antd";
import styles from "./index.module.css";

type ProgressStep = {
	title: string
	key: string
	description?: string
}

type ProgressTimelineProps = {
	getValues: () => Record<string, any>
	steps?: ProgressStep[]
	isSectionComplete?: (key: string, values: Record<string, any>) => boolean
}

const defaultSteps: ProgressStep[] = [
	{ title: "Event Details", key: "eventDetails"},
	{ title: "Date & Location", key: "dateLocation"},
	{ title: "Event Elements", key: "eventElements"},
	{ title: "Budget & Purchases", key: "budgetPurchase"},
	{ title: "Review", key: "review"},
];

const defaultIsSectionComplete = (key: string, values: Record<string, any>) => {
	switch (key) {
		case "eventDetails":
			return !!values.eventName;
		case "dateLocation":
			return !!values.date && !!values.location;
		case "eventElements":
			return !!values.eventElements?.length;
		case "budgetPurchase":
			return !!values.budget;
		case "review":
			return !!values.reviewed;
		default:
			return false;
	}
};

export default function ProgressTimeline({
	getValues,
	steps = defaultSteps,
	isSectionComplete = defaultIsSectionComplete
}: ProgressTimelineProps) {
	const values = getValues();
	const currentStep = steps.findIndex((step) => !isSectionComplete(step.key, values));
	const activeStep = currentStep === -1 ? steps.length - 1 : currentStep;

	return (
		<div className={styles.timeline}>
			<Steps
				current={activeStep}
				labelPlacement="vertical"
				items={steps.map((step) => ({
					key: step.key,
					title: step.title,
				}))}
			/>
		</div>
	);
}