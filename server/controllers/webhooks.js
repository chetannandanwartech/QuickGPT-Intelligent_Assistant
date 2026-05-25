import { response } from "express";
import Stripe from "stripe";

export const stripeWebhooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.)
    } catch (error) {
        
    }
}