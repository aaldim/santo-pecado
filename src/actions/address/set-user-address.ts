"use server";

import { Address } from "@/interfaces";
import prisma from "@/lib/prisma";

export const setUserAddress = async (address: Address, userId: string) => {
  try {
    const newAddress = await createOrReplaceAddress(address, userId);
    return {
      ok: true,
      address: newAddress,
      message: "User address set successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Error setting user address",
    };
  }
};

const createOrReplaceAddress = async (address: Address, userId: string) => {
  try {
    const storedAddress = await prisma.userAddress.findFirst({
      where: {
        userId,
      },
    });

    const addressToSave = {
      userId,
      address: address.address,
      address2: address.address2,
      firstName: address.firstName,
      city: address.city,
      lastName: address.lastName,
      phone: address.phone,
      postalCode: address.postalCode,
      countryId: address.country,
    };

    if (!storedAddress) {
      const newAddress = await prisma.userAddress.create({
        data: addressToSave,
      });
      return newAddress;
    }

    const updatedAddress = await prisma.userAddress.update({
      where: {
        userId,
      },
      data: addressToSave,
    });

    return updatedAddress;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating or replacing address");
  }
};
