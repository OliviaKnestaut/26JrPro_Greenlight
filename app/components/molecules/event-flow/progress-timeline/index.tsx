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
	currentEditingSection?: string 
	onSectionClick?: (key: string) => void
}

const defaultSteps: ProgressStep[] = [
	{ title: "Event Details", key: "eventDetails" },
	{ title: "Date & Location", key: "dateLocation" },
	{ title: "Event Elements", key: "eventElements" },
	{ title: "Budget & Purchases", key: "budgetPurchase" },
	{ title: "Review", key: "review" },
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
	currentEditingSection,
	onSectionClick,
}: ProgressTimelineProps) {
	// Safely get values and handle null/undefined cases
	let values: Record<string, any> = {};
	try {
		const rawValues = getValues?.();
		if (rawValues !== null && typeof rawValues === "object") {
			values = rawValues as Record<string, any>;
		}
	} catch (err) {
		console.warn(
			"ProgressTimeline: Error calling getValues(). Falling back to empty object.",
			err
		);
	}

	// Ensure steps is a valid array
	const validSteps = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps;

	// If currentEditingSection is provided, use it to determine the active step
	let activeStep: number;
	if (currentEditingSection) {
		const editingIndex = validSteps.findIndex(step => step.key === currentEditingSection);
		activeStep = editingIndex !== -1 ? editingIndex : 0;
	} else {
		const currentStep = validSteps.findIndex((step) => {
			try {
				return !isSectionComplete(step.key, values);
			} catch (err) {
				console.warn(`Error checking completion for section ${step.key}:`, err);
				return true;
			}
		});
		activeStep = currentStep === -1 ? validSteps.length - 1 : currentStep;
	}

	return (
		<div className={styles.timeline}>
			<Steps
				current={activeStep}
				labelPlacement="vertical"
				onChange={(index) => {
					const selectedStep = validSteps[index];
					if (selectedStep && onSectionClick) {
						onSectionClick(selectedStep.key);
					}
				}}
				items={validSteps.map((step, index) => {
					let status: "finish" | "process" | "wait" | "error" = "wait";
					
					try {
						const isComplete = isSectionComplete(step.key, values);
						const isCurrent = currentEditingSection === step.key;
						
						if (isComplete) {
							status = "finish";
						} else if (isCurrent) {
							status = "process";
						} else if (!isComplete && index < activeStep) {
							// Past sections that aren't complete should show as error
							status = "error";
						}
					} catch (err) {
						console.warn(`Error calculating status for section ${step.key}:`, err);
						status = "wait";
					}
					
					return {
						key: step.key,
						title: step.title,
						status: status,
					};
				})}
			/>
		</div>
	);
}