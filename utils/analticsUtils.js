import qs from "qs";

export const GetData = async (query, collection) => {
	try {
		const stringifiedQuery = qs.stringify(
			{
				where: query,
				limit: 100,
			},
			{ addQueryPrefix: true }
		);

		const req = await fetch(`/api/${collection}${stringifiedQuery}`);
		const res = await req.json();
		// if (!res.message) console.error(res);
		return res;
	} catch (err) {
		console.error(err);
		return err;
	}
};
