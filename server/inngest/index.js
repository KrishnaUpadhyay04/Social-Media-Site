import { Inngest } from 'inngest';
import User from '../models/User.js';

// Create a client to send and recieve events
export const inngest = new Inngest({ id: "pingup-app" });

// Inngest function to save user data to database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-cler'},
    {event: 'clerk/user.created'},
    async ({event}) => {
        const {id, first_name, last_name, email_address, image_url} = event.data
        let username = email_address[0].email_address.split('@')[0]

        // Check availability of username
        const user = await User.findOne({username})

        if(user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_address[0].email_address,
            full_name: first_name + " " + last_name,
            profile_picture: image_url,
            username
        }
        await User.create(userData)

    }
)

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-cler'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id, first_name, last_name, email_address, image_url} = event.data
        
        const updateUserData = {
            email: email_address[0].email_address,
            full_name: first_name + ' ' + last_name,
            profile_picture: image_url
        }
        await User.findByIdAndUpdate(id, updateUserData)

    }
)

// Inngest Function to delete user data in database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-cler'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data
        await User.findByIdAndDelete(id)
    }
)


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
];