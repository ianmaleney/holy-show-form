<script>
  let env = {};

  // Dev
  if (window.location.origin == "http://localhost:5000") {
    env.BASE_URL = "http://127.0.0.1:12345";
    env.STRIPE_PK = "pk_test_fadSqn0gB7MqLySRtfOBWR1w005p3NxTcH";
    env.STRIPE_PRICE = "price_1IBiDdLj2v47piuQoQTCblSJ";
  }

  // Staging
  if (window.location.origin == "https://romantic-shirley-e41538.netlify.app") {
    env.BASE_URL = "https://holy-show-api.herokuapp.com";
    env.STRIPE_PK = "pk_live_3ymhvrYbROWIf6UL18F4QOoL00KiG6nOWP";
    env.STRIPE_PRICE = "price_1IBiDdLj2v47piuQoQTCblSJ";
  }

  // Production
  if (window.location.origin == "https://holyshow.ie") {
    env.BASE_URL = "https://holy-show-api.herokuapp.com";
    env.STRIPE_PK = "pk_live_3ymhvrYbROWIf6UL18F4QOoL00KiG6nOWP";
    env.STRIPE_PRICE = "price_1IBiDdLj2v47piuQoQTCblSJ";
  }

  export let session_id;
  let state = "open";
  let api_url = `${env.BASE_URL}/create-checkout-session`;
  const stripe = window.Stripe(env.STRIPE_PK);
  let sub = {
    priceId: env.STRIPE_PRICE,
    start: "current",
  };

  const createCheckoutSession = async (subData) => {
    try {
      return await fetch(api_url, {
        method: "POST",
        body: JSON.stringify(subData),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(function (result) {
        return result.json();
      });
    } catch (error) {
      state = "open";
      console.log(error);
    }
  };

  let submit = async () => {
    state = "pending";
    createCheckoutSession(sub).then((data) => {
      stripe
        .redirectToCheckout({
          sessionId: data.sessionId,
        })
        .then((res) => console.log(res));
    });
  };
</script>

{#if session_id}
  <div data-session-id={session_id}>
    <h1>You've subscribed to Holy Show.</h1>
  </div>
{:else}
  <div class="formwrapper">
    <!-- Open Form -->
    {#if state == "open"}
      <form>
        <label for="subform_subscription">
          Start:
          <select id="subform_subscription" bind:value={sub.start}>
            <option value="current" selected>With Current Issue</option>
            <option value="next">With Next Issue</option>
          </select>
        </label>
        <button on:click={submit}>Subscribe</button>
      </form>
    {/if}

    <!-- Loading State -->
    {#if state == "pending"}
      <div class="svg-loader">
        <svg
          class="svg-container"
          height="100"
          width="100"
          viewBox="0 0 100 100"
        >
          <circle class="loader-svg bg" cx="50" cy="50" r="45" />
          <circle class="loader-svg animate" cx="50" cy="50" r="45" />
        </svg>
      </div>
    {/if}

    <!-- Closed State -->
    {#if state == "closed"}
      <div class="messagewrapper">
        <h1>This is a message.</h1>
      </div>
    {/if}
  </div>
{/if}

<style>
  .animate {
    stroke-dasharray: 242.6;
    animation: fill-animation 1s cubic-bezier(1, 1, 1, 1) 0s infinite;
  }

  @keyframes fill-animation {
    0% {
      stroke-dasharray: 40 242.6;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 141.3;
      stroke-dashoffset: 141.3;
    }
    100% {
      stroke-dasharray: 40 242.6;
      stroke-dashoffset: 282.6;
    }
  }

  .svg-loader {
    display: flex;
    position: relative;
    align-content: space-around;
    justify-content: center;
  }
  .loader-svg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    fill: none;
    stroke-width: 5px;
    stroke-linecap: round;
    stroke: rgb(64, 0, 148);
  }
  .loader-svg.bg {
    stroke-width: 8px;
    stroke: rgb(207, 205, 245);
  }

  form {
    font-family: Lusitana, Georgia, serif;
    color: rgb(94, 94, 94);
    border: 1px solid #ffd701;
    padding: 1.6rem;
    max-width: 640px;
    margin: 20px 10px;
  }
  button {
    background-color: rgb(255, 215, 1);
    color: rgb(22, 21, 20);
    padding: 8px 32px;
    border: none;
    border-radius: 0;
    margin: 1rem 0;
  }
  button:hover {
    background-color: rgb(245, 210, 75);
    cursor: pointer;
  }
</style>
