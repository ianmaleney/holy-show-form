import App from './App.svelte';

let params = new window.URLSearchParams(window.location.search);
let session_id = params.get("session_id");

const app = new App({
	target: document.body,
	props: {
		session_id: session_id || null
	}
});

export default app;