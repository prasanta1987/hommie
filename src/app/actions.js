'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from './firebase/config'; // Using client SDK
import { ref, update } from 'firebase/database';

// Define the schema for form validation
const BoardNameSchema = z.object({
  newName: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  deviceCode: z.string(),
  // The user ID will be passed securely to the action
  uid: z.string(), 
});

export async function updateBoardName(uid, prevState, formData) {
  
  // Validate the form data
  const validatedFields = BoardNameSchema.safeParse({
    newName: formData.get('newName'),
    deviceCode: formData.get('deviceCode'),
    uid: uid,
  });

  // If validation fails, return the errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { newName, deviceCode } = validatedFields.data;

  try {
    // Construct the database path for the specific board's name
    const boardNameRef = ref(db, `${uid}/${deviceCode}/name`);

    // Update the name in the Firebase Realtime Database
    await update(ref(db, `${uid}/${deviceCode}`), { name: newName });

  } catch (e) {
    return { message: `Database Error: ${e.message}` };
  }

  // Revalidate the home page path to reflect the changes immediately
  revalidatePath('/');

  // Return a success message and close the modal
  return { message: "success" };
} 
