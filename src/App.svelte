<script>
  import Form from "./Form.svelte";
  import Loader from "./Loader.svelte";
  import { state } from "./store";
  let formState;
  let env = {};

  state.subscribe((v) => {
    formState = v;
  });

  $: {
    console.log(`formState: ${formState}`);
  }

  // Dev
  if (window.location.origin == "http://localhost:5000") {
    env.BASE_URL = "http://127.0.0.1:12345";
    env.STRIPE_PK = "pk_test_fadSqn0gB7MqLySRtfOBWR1w005p3NxTcH";
    env.STRIPE_PRICE = "price_1IBiDdLj2v47piuQoQTCblSJ";
  }

  // Staging
  if (window.location.origin == "https://romantic-shirley-e41538.netlify.app") {
    env.BASE_URL = "https://holy-show-api.herokuapp.com";
    env.STRIPE_PK = "pk_test_fadSqn0gB7MqLySRtfOBWR1w005p3NxTcH";
    env.STRIPE_PRICE = "price_1IBiDdLj2v47piuQoQTCblSJ";
  }

  // Production
  if (window.location.origin == "https://holyshow.ie") {
    env.BASE_URL = "https://holy-show-api.herokuapp.com";
    env.STRIPE_PK = "pk_live_3ymhvrYbROWIf6UL18F4QOoL00KiG6nOWP";
    env.STRIPE_PRICE = "price_1IL59mLj2v47piuQOeS2GBnb";
  }
</script>

<div class="formwrapper">
  <!-- Open Form -->
  {#if formState == "open" || formState == "pending"}
    <Form {env} />
    <!-- Loading State -->
    {#if formState == "pending"}
      <Loader />
    {/if}
  {/if}

  <!-- Closed State -->
  {#if formState == "closed"}
    <div class="messagewrapper">
      <h1>This is a message.</h1>
    </div>
  {/if}

  <!-- Success State -->
  {#if formState == "succeeded"}
    <div class="messagewrapper">
      <h1>Success!</h1>
      <p>
        You have subscribed to Holy Show magazine. We will send you an email
        shortly with all your subscription details.
      </p>
    </div>
  {/if}
</div>

<style>
  .formwrapper {
    position: relative;
  }
</style>
