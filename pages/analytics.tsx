import payload from "payload";
import React, { useState, useEffect } from "react";
import { GetData } from "../utils/analticsUtils";

export default function Analytics() {
	const [userData, setUserData] = useState([]);
	const [userStartTime, setUserStartTime] = useState(new Date());

	const EventItem = ({ event }) => {
		var date = new Date(event.createdAt);
		const time = date.toTimeString();

		var seconds: number = (date.getTime() - userStartTime.getTime()) / 1000;
		var minutes: number = 0;
		if (seconds >= 60) {
			minutes = Math.trunc(seconds / 60);
			seconds = Math.trunc(seconds % 60);
		}

		return (
			<div className="bg-white shadow-md rounded p-4 flex gap-8">
				<p className="font-bold">{event.eventType}</p>
				<div className="flex flex-row gap-2">
					<p className="font-bold">Time:</p>
					<p>
						{minutes != 0 && minutes + "m"} {seconds}s
					</p>
				</div>
				{event.eventType != "Start" && (
					<div className="flex flex-row gap-2">
						<p className="font-bold">Question:</p>
						<p>{event.module}</p>
					</div>
				)}
			</div>
		);
	};

	const handleUserChange = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();
		const userId: string = event.target[0].value;

		const query = {
			userId: {
				equals: userId,
			},
		};

		const data = await GetData(query, "userEvents");

		// console.log(data.docs);

		const startEvent = data.docs.find(
			(event) => event.eventType == "Start"
		);

		console.log(startEvent);

		setUserStartTime(new Date(startEvent.createdAt));

		setUserData(data.docs.reverse());
	};

	return (
		<div className="p-8 flex gap-6 flex-col	">
			<h1 className="text-3xl font-bold">Analytics dashboard</h1>
			<form
				className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex gap-6 items-center"
				onSubmit={handleUserChange}
			>
				<label
					className="text-gray-700 text-sm font-bold"
					htmlFor="userid"
				>
					User ID:
				</label>
				<input
					className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="text"
					id="userid"
					autoComplete="off"
					defaultValue={2}
				></input>
				<button
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					type="submit"
				>
					Submit
				</button>
			</form>
			<ul className="flex flex-col gap-4">
				{userData.map((event) => (
					<li key={event.id}>
						<EventItem event={event} />
					</li>
				))}
			</ul>
		</div>
	);
}
