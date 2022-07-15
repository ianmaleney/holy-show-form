<script>
  export let env;
  import { onMount } from "svelte";
  import { state } from "./store";
  const stripe = window.Stripe(env.STRIPE_PK);
  let elements = stripe.elements();
  let api_url = `${env.BASE_URL}/create-subscription`;
  let card, user_alert_message;
  let user_alert_visible = false;

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

  const check_input_validity = (arr) => {
    let valid = true;
    arr.forEach((el) => {
      if (!el.checkValidity()) {
        console.log("Invalid input");
        valid = false;
        return;
      }
    });
    return valid;
  };

  const alert_the_user = (message) => {
    user_alert_message = message;
    user_alert_visible = true;
  };

  let submit = async (e) => {
    e.preventDefault();
    state.update((v) => "pending");

    // Validate the data
    let inputs = document.querySelectorAll("#payment-form input");

    if (check_input_validity([...inputs]) == false) {
      state.update((v) => "open");
      alert_the_user("Your info isn't quite right – have another look?");
      return;
    }

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
              alert_the_user(result.error.message);
            } else {
              // Successful subscription payment
              console.log({ result });
              state.update((v) => result.paymentIntent.status);
            }
          });
      } else {
        if (res.existing_customer) {
          state.update((v) => "open");
          alert_the_user(
            "There is already a subscriber with that email address. Please choose another."
          );
          return;
        }
        if (res.start === "current" || !res.subscriptionId) {
          state.update((v) => "open");
          alert_the_user("There has been an unknown error. Please try again.");
        } else {
          state.update((v) => "succeeded");
        }
      }
    } catch (error) {
      console.error(error);
      alert_the_user(error);
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

<form id="payment-form" class={$state === "pending" ? "pending" : ""}>
  <label for="payment-form--name" aria-required="true">Name</label>
  <input
    type="text"
    name="name"
    id="payment-form--name"
    placeholder=" "
    required
    bind:value={sub.name}
  />

  <label for="payment-form--email" aria-required="true">Email Address</label>
  <input
    type="email"
    name="email"
    id="payment-form--email"
    placeholder=" "
    required
    bind:value={sub.email}
  />
  <span class="validation-message">Invalid email address.</span>

  <label for="payment-form--address-line1" aria-required="true"
    >Street Address</label
  >
  <input
    type="text"
    name="address-line1"
    id="payment-form--address-line1"
    placeholder=" "
    required
    bind:value={sub.address.line1}
  />

  <label for="payment-form--address-line2">Address Line 2</label>
  <input
    type="text"
    name="address-line2"
    id="payment-form--address-line2"
    placeholder=" "
    bind:value={sub.address.line2}
  />

  <label for="payment-form--city" aria-required="true">City</label>
  <input
    type="text"
    name="city"
    id="payment-form--city"
    placeholder=" "
    required
    bind:value={sub.address.city}
  />

  <label for="payment-form--state" aria-required="true">State</label>
  <input
    type="text"
    name="state"
    id="payment-form--state"
    placeholder=" "
    required
    bind:value={sub.address.state}
  />

  <label for="payment-form--postal-code" aria-required="true">Postcode</label>
  <input
    type="text"
    name="postal-code"
    id="payment-form--postal-code"
    placeholder=" "
    bind:value={sub.address.postal_code}
    required
  />

  <label for="payment-form--country-name" aria-required="true">Country</label>
  <input
    type="text"
    name="country-name"
    id="payment-form--country-name"
    placeholder=" "
    bind:value={sub.address.country}
    required
  />

  <label for="subform_subscription" aria-required="true">
    Start:
    <select id="subform_subscription" bind:value={sub.start}>
      <option value="current" selected>With Issue 4 (Current Issue)</option>
      <option value="next">With Issue 5 (Summer 2023)</option>
    </select>
  </label>

  <div id="card-element">
    <!-- Elements will create input elements here -->
  </div>

  <!-- We'll put the error messages in this element -->
  <div id="card-element-errors" role="alert" />
  <button id="submit-button" on:click={submit}>Subscribe for €10 / year</button>

  <!-- Alert the user (sandboxed-iframe workaround) -->
  {#if user_alert_visible}
    <div id="user-alert">
      <div class="user-alert-underlay" />
      <div class="user-alert-text">
        <p>{user_alert_message}</p>
        <button
          on:click={() => {
            user_alert_visible = false;
          }}>Dismiss</button
        >
      </div>
    </div>
  {/if}
</form>

<style>
  form {
    max-width: 420px;
    border: 1px solid #eee;
    padding: 15px 8px;
    position: relative;
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

  input:invalid {
    outline: 1px solid red;
    margin-bottom: 5px;
  }
  .validation-message {
    display: none;
    font-size: 11px;
    font-family: "PT Serif", "Times New Roman", Times, serif;
  }

  input:invalid + .validation-message {
    display: block;
    margin-bottom: 20px;
  }

  input:placeholder-shown {
    outline: none !important;
    margin-bottom: 20px !important;
  }

  input:placeholder-shown + .validation-message {
    display: none;
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

  #user-alert {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
  }
  .user-alert-underlay {
    background-color: rgba(0, 0, 0, 0.45);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .user-alert-text {
    background-color: white;
    border: 2px solid #c28f10;
    border-radius: 6px;
    margin: 30px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 120;
    position: relative;
    max-width: 80%;
    padding: 10px;
  }
</style>
