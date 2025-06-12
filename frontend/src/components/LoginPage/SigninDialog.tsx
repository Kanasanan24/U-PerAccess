import { z } from 'zod';
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
import { Link } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldErrors, type UseFormReturn } from 'react-hook-form';

interface IFSigninForm {
    isLoad: boolean,
    form: UseFormReturn<signinType>,
    submitSignin: (values: signinType) => void,
    onInvalid: (errors: FieldErrors<signinType>) => void,
}

const signinBlueprint = z.object({
    email: z.string()
            .email({ message: "Please, enter a valid email." })
            .max(150, { message: "The email must be less than 150 characters."}),
    password: z.string()
                .min(8, { message: "password must be at least 8 characters long." })
                .max(100, { message: "password must be less than 100 characters." })
                .regex(/[a-z]/, { message: "password must contain at least one lowercase letter." })
                .regex(/[A-Z]/, { message: "password must contain at least one uppercase letter." })
                .regex(/[^a-zA-Z0-9]/, { message: "password must contain a special character." })
});
type signinType = z.infer<typeof signinBlueprint>;

const SigninForm = ({ form, isLoad, onInvalid, submitSignin }:IFSigninForm) => {
    return (
        <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(submitSignin, onInvalid)}>
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
                        <Button variant="outline">Cancel</Button>
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
    const [isLoad, setIsLoad] = useState<boolean>(false);

    const form = useForm<z.infer<typeof signinBlueprint>>({ // change validate to type
        resolver: zodResolver(signinBlueprint), // sync zod and react-hook-form
        defaultValues: { // initial variable
            email: "",
            password: ""
        }
    });

    const onInvalid = (_errors: FieldErrors<signinType>) => setTimeout(() => form.reset(), 5000);

    const submitSignin = (values: z.infer<typeof signinBlueprint>) => { // success case when validate
        setIsLoad(true);
        try {
            console.log(values);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className={cn('py-3 px-8')}>Sign in</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign in</DialogTitle>
                    <DialogDescription>
                        To access the user and permission management panel, along with other features.
                    </DialogDescription>
                </DialogHeader>
                <SigninForm isLoad={isLoad} form={form} onInvalid={onInvalid} submitSignin={submitSignin} />
            </DialogContent>
        </Dialog>
    );
}

export default SigninDialog;