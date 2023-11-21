/** @jsxImportSource @emotion/react */
import payload from "payload";
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { css } from "@emotion/react";
import { Label as FormLabel } from "@atlaskit/form";
import Select from "@atlaskit/select";
import PageHeader from "@atlaskit/page-header";

import { useRouter } from "next/router";
import Button from "@atlaskit/button";

export default function Analytics({ userOptions }) {
	const router = useRouter();

	const handleUserChange = async (userId: number) => {
		router.push(`analytics/${userId}`);
	};

	return (
		<div className="p-8 flex gap-6 flex-col justify-start min-h-screen">
			<div className="-mt-6">
				<PageHeader
					breadcrumbs={
						<a href="/" css={homeLinkStyles}>
							Home
						</a>
					}
				>
					Analytics dashboard
				</PageHeader>
				<span css={subtitleStyles}>
					View the physiological signs overlayed with the events from
					an interview.
				</span>
			</div>
			<div className="w-96">
				<FormLabel htmlFor="user-select">
					Select a user to view individually
				</FormLabel>
				<Select
					className="single-select"
					classNamePrefix="react-select"
					instanceId="user-select"
					options={userOptions}
					placeholder="Users"
					onChange={(user) => handleUserChange(Number(user.value))}
				/>
			</div>
			<div>
				<FormLabel htmlFor="group-comparison-button">
					View group comparisons
				</FormLabel>
				<br></br>
				<Button
					onClick={() => router.push(`analytics/group-comparison`)}
				>
					Group comparisons
				</Button>
			</div>
		</div>
	);
}

const homeLinkStyles = css({
	color: "#6B778C",
	paddingBottom: "8",
	"&:hover": {
		textDecoration: "underline",
	},
});

const subtitleStyles = css({
	display: "flex",
	color: "#616f86",
	marginTop: -16,
	alignItems: "baseline",
});

export async function getServerSideProps() {
	const usersPayload = await payload.find({
		collection: "participantData",
		limit: 10000,
	});

	const filteredUsers = usersPayload.docs.filter(
		(u) => u.experimentData === true
	);

	const userOptions = filteredUsers.map((user) => {
		const createdAt = new Date(user.createdAt);
		return {
			label: `${user.id} (${createdAt.toString().slice(0, 24)})${
				user.stress ? " - STRESS" : ""
			}`,
			value: user.id,
		};
	});

	userOptions.reverse();

	return { props: { userOptions } };
}
