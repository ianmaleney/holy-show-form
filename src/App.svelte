<script>
  import { onMount } from "svelte";
  import Form from "./Form.svelte";
  import Loader from "./Loader.svelte";
  import { state } from "./store";
  let env = {};

  $: {
    console.log(`state: ${$state}`);
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
    env.STRIPE_PK = "pk_live_3ymhvrYbROWIf6UL18F4QOoL00KiG6nOWP";
    env.STRIPE_PRICE = "price_1IL59mLj2v47piuQOeS2GBnb";
  }

  // Production
  if (window.location.origin == "https://holyshow.ie") {
    env.BASE_URL = "https://holy-show-api.herokuapp.com";
    env.STRIPE_PK = "pk_live_3ymhvrYbROWIf6UL18F4QOoL00KiG6nOWP";
    env.STRIPE_PRICE = "price_1IL59mLj2v47piuQOeS2GBnb";
  }

  onMount(() => {
    console.log("Origin: ", window.location.origin);
    fetch(`${env.BASE_URL}`)
      .then((res) => res.text())
      .then((m) => console.log(m));
  });
</script>

<div class="formwrapper">
  <!-- Open Form -->
  {#if $state == "open" || $state == "pending"}
    <Form {env} />
    <!-- Loading State -->
    {#if $state == "pending"}
      <Loader />
    {/if}
  {/if}

  <!-- Closed State -->
  {#if $state == "closed"}
    <div class="messagewrapper">
      <h1>This is a message.</h1>
    </div>
  {/if}

  <!-- Success State -->
  {#if $state == "succeeded"}
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
