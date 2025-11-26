"use client";

import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail01Icon, User03Icon, CheckmarkBadge04Icon } from "@hugeicons/core-free-icons";
import InputWithIcon from "@/components/ui/input-with-icon";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { appealSchema, AppealFormValues } from "@/lib/form-validations";
import { HugeiconsIcon } from "@hugeicons/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSuspendedAccountModal } from "@/hooks/general-store";


const AppealSuspensionForm = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const { context } = useSuspendedAccountModal()

  const form = useForm<AppealFormValues>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      email: "",
      role: context?.role || "user",
      licenseNumber: "",
      appealMessage: "",
    },
  });

  const selectedRole = form.watch("role");

  const submitForm = async (values: AppealFormValues) => {
    setIsLoading(true);

    try {
      // Handle form submission here
      console.log("Appeal data:", values);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Appeal submitted successfully! We'll review your case shortly.");
      form.reset();
    } catch (error) {
      console.error('Appeal submission error:', error);
      toast.error("Something went wrong! Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="flex-1">
        <div className="flex flex-col justify-between md:max-w-[500px] max-w-[450px] lg:min-h-[250px] min-h-[120px]">
          <div className="flex flex-col gap-3">
            <h2 className="lg:text-4xl text-3xl font-semibold font-quicksand">Submit Appeal</h2>
            <p className='text-sm lg:text-base'>
              If you believe your account was suspended by mistake, please submit an appeal.
              Provide your details and explain your situation clearly for our review team.
            </p>
          </div>
          <div className="lg:flex flex-col gap-1 hidden">
            <p className="mt-1 text-sm md:text-base">
              Need immediate assistance?{" "}
              <a href="mailto:support@nomeo.com" className="font-semibold">
                Contact Support
              </a>
            </p>
            <p className="text-sm md:text-base">
              For account restoration inquiries, please ensure all information provided is accurate.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          className="md:max-w-[500px] max-w-[450px] w-full flex flex-col gap-4"
          autoComplete="off"
          onSubmit={form.handleSubmit(submitForm)}
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    id="email"
                    inputClassName="placeholder:text-white/70"
                    placeholder="Email Address"
                    className="border rounded-lg"
                    icon={Mail01Icon}
                    iconClassName="text-white"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="bg-white rounded py-1 px-3 w-fit" />
              </FormItem>
            )}
          />

          {/* Role Selection - Subtle Button Style */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-2"
                  >
                    {/* User Option */}
                    <FormItem className="flex-1">
                      <FormControl>
                        <RadioGroupItem value="user" className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${field.value === "user"
                          ? "bg-secondary-blue text-white shadow-md"
                          : "text-white hover:bg-white/10"
                          }`}
                      >
                        <HugeiconsIcon icon={User03Icon} className="w-5 h-5" />
                        <span className="font-medium">User</span>
                      </FormLabel>
                    </FormItem>

                    {/* Agent Option */}
                    <FormItem className="flex-1">
                      <FormControl>
                        <RadioGroupItem value="agent" className="sr-only" />
                      </FormControl>
                      <FormLabel
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${field.value === "agent"
                          ? "bg-secondary-blue text-white shadow-md"
                          : "text-white hover:bg-white/10"
                          }`}
                      >
                        <HugeiconsIcon icon={CheckmarkBadge04Icon} className="w-5 h-5" />
                        <span className="font-medium">Agent</span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="bg-white rounded py-1 px-3 w-fit" />
              </FormItem>
            )}
          />

          {/* License Number (Conditional for Agents) */}
          {selectedRole === "agent" && (
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      id="licenseNumber"
                      inputClassName="placeholder:text-white/70"
                      placeholder="Real Estate License Number"
                      className="border rounded-lg"
                      icon={CheckmarkBadge04Icon}
                      iconClassName="text-white"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="bg-white rounded py-1 px-3 w-fit" />
                </FormItem>
              )}
            />
          )}

          {/* Appeal Message Textarea */}
          <FormField
            control={form.control}
            name="appealMessage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      id="appealMessage"
                      placeholder="Please explain why you believe your account should be reinstated. Include any relevant details or context that might help us review your case."
                      className="text-sm border rounded-lg px-4 py-3 placeholder:text-white/70 min-h-[120px] resize-none bg-inherit"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="bg-white rounded py-1 px-3 w-fit" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <LoadingButton
            className="text-sm lg:text-base bg-secondary-blue text-white h-12 rounded-lg mt-6 disabled:bg-secondary-blue/50"
            label="Submit Appeal"
            loadingLabel="Submitting appeal..."
            type="submit"
            isLoading={isLoading}
          />

          {/* Additional Information */}
          <p className="text-center md:text-sm text-xs">
            We typically respond to appeals within 2-3 business days.{" "}
          </p>
        </form>
      </Form>
    </React.Fragment>
  );
};

export default AppealSuspensionForm;