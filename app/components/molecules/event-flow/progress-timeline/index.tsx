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
	currentEditingSection?: string // Override to show specific step as current
}

const defaultSteps: ProgressStep[] = [
	{ title: "Event Details", key: "eventDetails"},
	{ title: "Date & Location", key: "dateLocation"},
	{ title: "Event Elements", key: "eventElements"},
	{ title: "Budget & Purchases", key: "budgetPurchase"},
	{ title: "Review", key: "review"},
];

const defaultIsSectionComplete = (key: string, values: Record<string, any>): boolean => {
	switch (key) {
		case "eventDetails":
			// Required fields: event_img, title, description, attendees
			return !!values.event_img && !!values.title && !!values.description && !!values.attendees;
		case "dateLocation":
			// Required fields: event_date, start_time, end_time, location_type
			// Also check virtual_link if Virtual is selected
			const hasBasicFields = !!values.event_date && !!values.start_time && !!values.end_time && !!values.location_type;
			if (values.location_type === "Virtual") {
				return hasBasicFields && !!values.virtual_link;
			}
			// For On-Campus or Off-Campus, check if nested location details exist
			if (values.location_type === "On-Campus") {
				return hasBasicFields && !!values.form_data?.location?.selected;
			}
			if (values.location_type === "Off-Campus") {
				return hasBasicFields && !!values.form_data?.offCampus?.address;
			}
			return hasBasicFields;
		case "eventElements":
			// Check if user has selected at least one element (excluding no_additional_elements)
			const elements = values.form_data?.elements || {};
			const hasElements = Object.keys(elements).some(
				key => key !== 'no_additional_elements' && elements[key] === true
			);
			const hasNoElements = elements.no_additional_elements === true;
			// Complete if user selected elements OR explicitly said no elements
			return hasElements || hasNoElements;
		case "budgetPurchase":
			// Budget section is optional but always complete since it's informational
			return true;
		case "review":
			// All previous sections must be completed
			return defaultIsSectionComplete("eventDetails", values) && 
				   defaultIsSectionComplete("dateLocation", values);
		default:
			return false;
	}
};

export default function ProgressTimeline({
	getValues,
	steps = defaultSteps,
	isSectionComplete = defaultIsSectionComplete,
	currentEditingSection
}: ProgressTimelineProps) {
	const rawValues = getValues();
	const values: Record<string, any> =
		rawValues !== null && typeof rawValues === "object"
			? (rawValues as Record<string, any>)
			: (() => {
					console.warn(
						"ProgressTimeline: getValues() did not return a valid object. Falling back to an empty object."
					);
					return {};
				})();
	
	// If currentEditingSection is provided, use it to determine the active step
	let activeStep: number;
	if (currentEditingSection) {
		const editingIndex = steps.findIndex(step => step.key === currentEditingSection);
		activeStep = editingIndex !== -1 ? editingIndex : 0;
	} else {
		const currentStep = steps.findIndex((step) => !isSectionComplete(step.key, values));
		activeStep = currentStep === -1 ? steps.length - 1 : currentStep;
	}

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