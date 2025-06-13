import { z } from 'zod';
import axios from "axios";
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot
} from "@/components/ui/input-otp";
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, Bounce, type ToastOptions } from "react-toastify";
import { useForm, type UseFormReturn } from 'react-hook-form';

interface IFSignupForm {
    isLoad: boolean,
    form: UseFormReturn<signinType>,
    prepareSignup: (values: signinType) => void,
}

interface IFTokenForm {
    token: number,
    isLoad: boolean,
    refCode: string,
    countdown: number,
    isAvailableSend: boolean,
    sendOTP: () => Promise<void>,
    submitSignup: () => Promise<void>,
    setToken: React.Dispatch<React.SetStateAction<number>>,
    setCurrentPage: React.Dispatch<React.SetStateAction<1 | 2>>
}

export const toastOptions:ToastOptions<unknown> = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
}

const signinBlueprint = z.object({
    firstname: z.string()
                .min(3, { message: "firstname must be at least 3 characters long." })
                .max(100, { message: "firstname must be less than 100 characters." }),
    lastname: z.string()
                .min(3, { message: "lastname must be at least 3 characters long." })
                .max(100, { message: "lastname must be less than 100 characters." }),
    email: z.string()
            .email({ message: "Please, enter a valid email." })
            .max(200, { message: "The email must be less than 200 characters."}),
    password: z.string()
                .min(8, { message: "password must be at least 8 characters long." })
                .max(100, { message: "password must be less than 100 characters." })
                .regex(/[a-z]/, { message: "password must contain at least one lowercase letter." })
                .regex(/[A-Z]/, { message: "password must contain at least one uppercase letter." })
                .regex(/[^a-zA-Z0-9]/, { message: "password must contain a special character." }),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "password does not match.",
    path: ["confirm_password"]
})
type signinType = z.infer<typeof signinBlueprint>;

const SignupForm = ({ form, isLoad, prepareSignup }:IFSignupForm) => {
    return (
        <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(prepareSignup)}>
                <div className="flex gap-5">
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Firstname</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Enter your firstname..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lastname</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="Enter your lastname..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Enter your email..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your password..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="Enter your confirm password..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                        {isLoad && (<Loader2Icon className="animate-spin" />)}
                        Verify Email
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

const TokenForm = ({ token, isLoad, refCode, sendOTP, setToken, countdown, submitSignup, setCurrentPage, isAvailableSend }:IFTokenForm) => {
    return (
        <div className="flex flex-col items-center gap-5">
            <p className="font-bold text-sm">OTP Verification</p>
            <p className="text-[0.7rem] text-gray-400">ref: {refCode}</p>
            <InputOTP
                type="string"
                maxLength={6}
                value={String(token)}
                onChange={(value) => setToken(isNaN(Number(value)) ? 0 : Number(value))}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            <Button variant="link" onClick={sendOTP} className="underline hover:text-orange-400" disabled={!isAvailableSend}>
                {!isAvailableSend && `Please, wait ${countdown} second to re-send.`}
                {isAvailableSend && "Re-send OTP To Email"}
            </Button>
            <div className="flex justify-end items-center gap-2 mt-5 w-full">
                <Button variant="outline" onClick={() => setCurrentPage(1)}>Go Back</Button>
                <Button onClick={submitSignup}>
                    {isLoad && (<Loader2Icon className="animate-spin" />)}
                    Submit
                </Button>
            </div>
        </div>
    );
}

const SignupDialog = () => {
    // navigate
    const navigate = useNavigate();
    // state
    const [token, setToken] = useState<number>(0);
    const [countdown, setCountdown] = useState(60);
    const [refCode, setRefCode] = useState<string>("");
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [currentPage, setCurrentPage] = useState<1 | 2>(1);
    const [isAvailableSend, setIsAvailableSend] = useState(true);
    const [formData, setFormData] = useState<z.infer<typeof signinBlueprint> | null>(null);
    // zod validate
    const form = useForm<z.infer<typeof signinBlueprint>>({ // change validate to type
        resolver: zodResolver(signinBlueprint), // sync zod and react-hook-form
        defaultValues: { // initial variable
            email: "",
            password: ""
        }
    });
    // effect
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    // function
    const prepareSignup = (values: z.infer<typeof signinBlueprint>) => {
        setFormData(values);
        setCurrentPage(2);
    }
    const sendOTP = async() => { // success case when validate
        if (!isAvailableSend) {
            toast.info("Please, wait 1 minute to re-send OTP.", toastOptions);
            return;
        }
        // prepare
        startCountdown();
        setIsLoad(true);
        try {
            const response = await toast.promise(
                axios.post(`${import.meta.env.VITE_API}/verify/email`, {
                    email: formData?.email
                }),
                {
                    pending: "Promise is pending...",
                    success: "Promise resolved",
                    error: "Promise rejected",
                }
            );
            if (response?.data?.message) {
                const res = response.data;
                setRefCode(res.ref);
                toast.success(response.data.message, toastOptions);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data?.message) toast.error(error.response.data.message, toastOptions);
                else toast.error("Something went wrong.", toastOptions);
            } else toast.error("Something went wrong.", toastOptions);
        } finally {
            setIsLoad(false);
            setCurrentPage(2);
        }
    }
    const submitSignup = async() => {
        setIsLoad(true);
        try {
            // check otp
            if (token === 0 || refCode === "") {
                toast.info("Please, verify your email before submit", toastOptions);
                return;
            }
            // prepare
            const { confirm_password, ...modifyForm } = formData!;
            const response = await toast.promise(
                axios.post(`${import.meta.env.VITE_API}/signup`, {
                    ...modifyForm, token, reference_code: refCode
                }, {
                    withCredentials: true
                }),
                {
                    pending: "Promise is pending...",
                    success: "Promise resolved",
                    error: "Promise rejected",
                }
            );
            if (response?.data?.message) {
                toast.success(response.data.message, toastOptions);
                navigate("/dashboard");
            }
            else toast.error("Something went wrong.", toastOptions);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data?.message) toast.error(error.response.data.message, toastOptions);
                else toast.error("Something went wrong.", toastOptions);
            } else toast.error("Something went wrong.", toastOptions);
        } finally {
            setIsLoad(false);
        }
    }
    const startCountdown = () => {
        setIsAvailableSend(false);
        setCountdown(60);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setIsAvailableSend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    // render
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className={cn('py-3 px-8')}>Sign up</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign up</DialogTitle>
                        <DialogDescription>
                            To try out the user management system, including access control and role-based permissions for managing your own data within the system.
                        </DialogDescription>
                    </DialogHeader>
                    {currentPage === 1 && (
                        <SignupForm
                            form={form}
                            isLoad={isLoad}
                            prepareSignup={prepareSignup}
                        />
                    )}
                    {currentPage === 2 && (
                        <TokenForm
                            token={token}
                            isLoad={isLoad}
                            refCode={refCode}
                            sendOTP={sendOTP}
                            setToken={setToken}
                            countdown={countdown}
                            submitSignup={submitSignup}
                            setCurrentPage={setCurrentPage}
                            isAvailableSend={isAvailableSend}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default SignupDialog;