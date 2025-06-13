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
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toastOptions } from './SignupDialog';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

interface IFSigninForm {
    isLoad: boolean,
    form: UseFormReturn<signinType>,
    submitSignin: (values: signinType) => void,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const signinBlueprint = z.object({
    email: z.string()
            .email({ message: "Please, enter a valid email." })
            .max(200, { message: "The email must be less than 200 characters."}),
    password: z.string()
                .min(8, { message: "password must be at least 8 characters long." })
                .max(100, { message: "password must be less than 100 characters." })
});
type signinType = z.infer<typeof signinBlueprint>;

const SigninForm = ({ form, isLoad, setIsOpen, submitSignin }:IFSigninForm) => {
    return (
        <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(submitSignin)}>
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
                <Link to="#" className="text-sm underline hover:text-orange-600 transition duration-150 ease-in">Forgot password?</Link>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">
                        {isLoad && (<Loader2Icon className="animate-spin" />)}
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

const SigninDialog = () => {
    // navigate
    const navigate = useNavigate();
    // state
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // zod validate
    const form = useForm<z.infer<typeof signinBlueprint>>({ // change validate to type
        resolver: zodResolver(signinBlueprint), // sync zod and react-hook-form
        defaultValues: { // initial variable
            email: "",
            password: ""
        }
    });
    // function
    const submitSignin = async(values: z.infer<typeof signinBlueprint>) => { // success case when validate
        setIsLoad(true);
        try {
            const response = await toast.promise(
                axios.post(`${import.meta.env.VITE_API}/signin`, {
                    email: values.email, password: values.password
                }, {
                    withCredentials: true
                }),
                {
                    pending: "Promise is pending...",
                    success: "Promise resolved",
                    error: "Promise rejected",
                }
            );
            if  (response?.data?.message) {
                toast.success(response.data.message, toastOptions);
                navigate("/dashboard");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data?.message) toast.error(error.response.data.message, toastOptions);
                else toast.error("Something went wrong.", toastOptions);
            } else toast.error("Something went wrong.", toastOptions);
        } finally {
            setIsLoad(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={cn('py-3 px-8')} onClick={() => setIsOpen(true)}>Sign in</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign in</DialogTitle>
                    <DialogDescription>
                        To access the user and permission management panel, along with other features.
                    </DialogDescription>
                </DialogHeader>
                <SigninForm isLoad={isLoad} form={form} setIsOpen={setIsOpen} submitSignin={submitSignin} />
            </DialogContent>
        </Dialog>
    );
}

export default SigninDialog;