import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes));

export const formatKeys = (keys: string[]) => keys.join(" + ");

export const generateId = () => crypto.randomUUID();
