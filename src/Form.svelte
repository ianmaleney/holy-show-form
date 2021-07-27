<script>
  export let env;
  import { onMount } from "svelte";
  import { state } from "./store";
  const stripe = window.Stripe(env.STRIPE_PK);
  let elements = stripe.elements();
  let api_url = `${env.BASE_URL}/create-subscription`;
  let card, formState;

  state.subscribe((v) => {
    formState = v;
  });

  let sub = {
    priceId: env.STRIPE_PRICE,
    start: "current",
    name: "",
    email: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
  };

  let wakeup = async () => {
    try {
      return await fetch(env.BASE_URL).then((res) => res.text());
    } catch (error) {
      state.update((v) => "open");
      console.log(error);
    }
  };

  let submit = async (e) => {
    e.preventDefault();
    state.update((v) => "pending");

    // Submit the data
    try {
      let res = await fetch(api_url, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
      }).then((d) => d.json());

      console.log({ res });

      if (res.clientSecret) {
        // Handle the payment
        stripe
          .confirmCardPayment(res.clientSecret, {
            payment_method: {
              card: card,
              billing_details: {
                name: sub.name,
              },
            },
          })
          .then((result) => {
            if (result.error) {
              alert(result.error.message);
            } else {
              // Successful subscription payment
              console.log({ result });
              state.update((v) => result.paymentIntent.status);
            }
          });
      } else {
        if (res.start === "current" || !res.subscriptionId) {
          state.update((v) => "open");
          alert("There has been an unknown error. Please try again.");
        } else {
          state.update((v) => "succeeded");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  onMount(() => {
    card = elements.create("card");
    card.mount("#card-element");
    card.on("change", function (event) {
      displayError(event);
    });
    function displayError(event) {
      let displayError = document.getElementById("card-element-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
    }
  });
</script>

<form
  id="payment-form"
  on:focus={wakeup}
  class={formState === "pending" ? "pending" : ""}
>
  <label for="payment-form--name" aria-required="true">Name</label>
  <input
    type="text"
    name="name"
    id="payment-form--name"
    required
    bind:value={sub.name}
  />

  <label for="payment-form--email" aria-required="true">Email Address</label>
  <input
    type="email"
    name="email"
    id="payment-form--email"
    required
    bind:value={sub.email}
  />

  <label for="payment-form--address-line1" aria-required="true"
    >Street Address</label
  >
  <input
    type="text"
    name="address-line1"
    id="payment-form--address-line1"
    required
    bind:value={sub.address.line1}
  />

  <label for="payment-form--address-line2">Address Line 2</label>
  <input
    type="text"
    name="address-line2"
    id="payment-form--address-line2"
    bind:value={sub.address.line2}
  />

  <label for="payment-form--city" aria-required="true">City</label>
  <input
    type="text"
    name="city"
    id="payment-form--city"
    required
    bind:value={sub.address.city}
  />

  <label for="payment-form--state" aria-required="true">State</label>
  <input
    type="text"
    name="state"
    id="payment-form--state"
    required
    bind:value={sub.address.state}
  />

  <label for="payment-form--postal-code" aria-required="true">Postcode</label>
  <input
    type="text"
    name="postal-code"
    id="payment-form--postal-code"
    bind:value={sub.address.postal_code}
    required
  />

  <label for="payment-form--country-name" aria-required="true">Country</label>
  <input
    type="text"
    name="country-name"
    id="payment-form--country-name"
    bind:value={sub.address.country}
    required
  />

  <label for="subform_subscription" aria-required="true">
    Start:
    <select id="subform_subscription" bind:value={sub.start}>
      <option value="current" selected>With Current Issue</option>
      <option value="next">With Next Issue</option>
    </select>
  </label>

  <div id="card-element">
    <!-- Elements will create input elements here -->
  </div>

  <!-- We'll put the error messages in this element -->
  <div id="card-element-errors" role="alert" />
  <button on:click={submit}>Subscribe for €10 / year</button>
</form>

<style>
  form {
    max-width: 420px;
    border: 1px solid #eee;
    padding: 15px 8px;
  }

  :global(.pending) {
    z-index: -1;
    opacity: 0.3;
  }
  label {
    font-family: "PT Serif", "Times New Roman", Times, serif;
    font-size: 12px;
  }

  label[aria-required="true"]:before {
    content: "* ";
    color: red;
  }

  input {
    font-family: "PT Serif", "Times New Roman", Times, serif;
    font-size: 12px;
    margin: 4px 0 20px;
    width: 100%;
  }

  #card-element {
    margin: 40px 0;
    background-color: #eee;
    padding: 15px 5px;
  }

  #card-element-errors {
    margin: 10px 0 20px;
  }

  button {
    background-color: #fbc02d;
    border-radius: 4px;
    font-family: "PT Serif", "Times New Roman", Times, serif;
    color: white;
    font-size: 14px;
    border: none;
    padding: 12px 24px;
  }
  button:hover {
    background-color: #c28f10;
    cursor: pointer;
  }
</style>
