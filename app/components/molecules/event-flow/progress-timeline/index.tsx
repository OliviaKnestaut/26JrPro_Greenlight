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
	errors?: Record<string, any>
	visitedSections?: string[]
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
			// For On-Campus, check if a building/room has been selected
			if (values.location_type === "On-Campus") {
				return hasBasicFields && !!values.form_data?.location?.selected;
			}
			// For Off-Campus, field is stored at form_data.location.off_campus_address
			if (values.location_type === "Off-Campus") {
				return hasBasicFields && !!values.form_data?.location?.off_campus_address;
			}
			return hasBasicFields;
		case "eventElements":
			// Check if user has selected at least one element (excluding no_additional_elements)
			const elements = values.form_data?.elements || {};
			const hasElements = Object.keys(elements).some(
				key => key !== 'no_additional_elements' && elements[key] === true
			);
			const hasNoElements = elements.no_additional_elements === true;
			if (hasNoElements) return true;
			if (!hasElements) return false;
			// Each checked element opens a nested section — all must have their
			// primary required field filled before eventElements is considered complete
			const nestedComplete = [
				{ el: 'food',       ok: !!values.form_data?.food?.type },
				{ el: 'alcohol',    ok: !!values.form_data?.alcohol?.vendor },
				{ el: 'minors',     ok: !!values.form_data?.minors?.student_contact_id },
				{ el: 'movies',     ok: !!values.form_data?.movies?.option_type },
				{ el: 'raffles',    ok: !!values.form_data?.raffles?.items_and_purchase_plan },
				{ el: 'fire',       ok: !!values.form_data?.fire?.type },
				{ el: 'sorc_games', ok: !!(values.form_data?.sorc_games?.selected?.length) && !!values.form_data?.sorc_games?.location },
			].every(({ el, ok }) => !elements[el] || ok);
			return nestedComplete;
		case "budgetPurchase": {
			const level0Confirmed = values.form_data?.level0_confirmed === true;

			// Level 0 confirmed → nothing else needed in this section
			if (level0Confirmed) return true;

			// Re-derive Level 0 eligibility (mirrors BudgetPurchasesSection logic).
			// If the event still qualifies for Level 0 but the user hasn't ticked the
			// confirmation checkbox, the step is not yet complete.
			const elements = values.form_data?.elements || {};
			const noAdditionalElements = elements.no_additional_elements === true;
			const hasOtherElements = Object.keys(elements).some(k => k !== 'no_additional_elements' && elements[k] === true);
			const isOffCampus = values.location_type === "Off-Campus";
			const hasHighAttendance = values.attendees && parseInt(values.attendees) >= 150;
			const isLevel0Eligible = noAdditionalElements && !hasOtherElements && !isOffCampus && !hasHighAttendance;
			if (isLevel0Eligible) return false;

			// Non-Level-0: check only the fields that are conditionally required.
			const vendors = values.form_data?.vendors || [];
			const nonVendorServices = values.form_data?.non_vendor_services || {};
			const hasVendors = vendors.length > 0;
			const hasServices = Object.values(nonVendorServices).some(Boolean);

			// Vendor letter acknowledgement — required when vendors are added
			if (hasVendors && !values.form_data?.vendors_notice_acknowledged) return false;

			// Non-vendor services acknowledgement — required when services are selected
			if (hasServices && !values.form_data?.non_vendor_services_acknowledged) return false;

			// Funding source + account number — required when vendors, elements, or services exist
			if ((hasVendors || hasOtherElements || hasServices) &&
				(!values.form_data?.budget?.source || !values.form_data?.budget?.account_number)) return false;

			return true;
		}
		case "review":
			// Never auto-complete — this step only becomes active when the user is
			// actually on the review page (currentEditingSection="review" drives the UI).
			return false;
		default:
			return false;
	}
};

// Top-level RHF error keys that belong to each section
const sectionTopLevelErrorFields: Record<string, string[]> = {
	eventDetails: ['event_img', 'title', 'description', 'attendees'],
	dateLocation: ['event_date', 'start_time', 'end_time', 'location_type', 'virtual_link'],
	eventElements: [],
	budgetPurchase: [],
};

// form_data sub-keys whose errors belong to each section
const sectionFormDataErrorKeys: Record<string, string[]> = {
	dateLocation: ['location', 'needs_setup_time', 'travel'],
	eventElements: ['elements', 'level0_confirmed', 'food', 'alcohol', 'minors', 'movies', 'raffles', 'fire', 'sorc_games'],
	budgetPurchase: ['budget', 'vendors', 'vendors_notice_acknowledged', 'non_vendor_services', 'non_vendor_services_notes', 'non_vendor_services_acknowledged'],
	eventDetails: [],
};

const hasSectionErrors = (sectionKey: string, errors: Record<string, any>): boolean => {
	const topLevel = sectionTopLevelErrorFields[sectionKey] || [];
	if (topLevel.some(f => !!errors[f])) return true;
	const formDataKeys = sectionFormDataErrorKeys[sectionKey] || [];
	const formDataErrors = errors?.form_data as any;
	return formDataKeys.some(k => !!formDataErrors?.[k]);
};

export default function ProgressTimeline({
	getValues,
	steps = defaultSteps,
	isSectionComplete = defaultIsSectionComplete,
	currentEditingSection,
	onSectionClick,
	errors = {},
	visitedSections,
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

					// Budget & Purchases is locked until Event Elements is complete
					const isLocked = step.key === "budgetPurchase" && !isSectionComplete("eventElements", values);

					try {
						const isActive = step.key === currentEditingSection || index === activeStep;

						// Active is always blue — checked before everything else
						if (isActive) {
							status = "process";
						} else {
							const hasErrors = hasSectionErrors(step.key, errors);
							const isComplete = isSectionComplete(step.key, values) && !hasErrors;
							const wasVisited = visitedSections?.includes(step.key) ?? false;

							if (isComplete) {
								status = "finish";
							} else if (wasVisited || hasErrors) {
								// Visited but not finished → X
								status = "error";
							}
							// else stays "wait" (gray — not yet visited)
						}
					} catch (err) {
						console.warn(`Error calculating status for section ${step.key}:`, err);
					}

					return {
						key: step.key,
						title: step.title,
						status,
						disabled: isLocked,
					};
				})}
			/>
		</div>
	);
}