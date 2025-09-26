"use client";


import {Form, FormControl, FormField, FormItem, FormMessage,} from "@/components/ui/form";
import { ArrowUpRight03Icon, Cancel01Icon, Delete01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { createBlogSchema, createBlogValues } from "@/lib/form-validations";
import { uploadImage } from "@/utils/upload-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import TipTap from "./tip-tap";
import InputWithIcon from "@/components/ui/input-with-icon";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorState from "@/components/ui/error-state";
import EmptyState from "@/components/ui/empty-state";
import { usePathname, useRouter } from "next/navigation";
import { userProps } from "@/lib/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { deleteCloudinaryImages } from "@/actions/delete-cloudinary-image";
import { createNewBlog, createNewDraft } from "@/actions/blog-actions";

type searchedUserDetail = {
  _id: string;
  email: string;
  surName: string;
  lastName: string;
  profilePicture: string;
};

const CreateBlogForm = ({user}:{user:userProps}) => {

  const maxTitleLength = 100;
  const maxDescriptionLength = 400;

  const defaultBlogValues = {
    title: "",
    bannerImageUrl: "",
    bannerImagePublicId: "",
    description: "",
    content: "",
  };

  const form = useForm<createBlogValues>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: defaultBlogValues,
  });

  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description");
  const watchedContent = form.watch("content");
  const watchedBannerImageUrl = form.watch("bannerImageUrl");
  const watchedBannerImagePublicId = form.watch("bannerImagePublicId");

  const router = useRouter();

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState<string | null>(null);
  const [imageLoading, setImageLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [clearContent, setClearContent] = React.useState(false);

  const queryClient = useQueryClient();

  const getWordCount = (text: string) => {
    const words = text.split(/\s+/).filter(Boolean);
    const wordsCount = words.length;

    return wordsCount;
  };

  const wordsCounts = getWordCount(watchedContent);
  const wordPerMinute = 100;
  const readTime = Math.floor(wordsCounts / wordPerMinute);

  const [remainingTitleChar, setRemainingTitleChar] = React.useState(maxTitleLength);
  const [remainingDescriptionChar, setRemainingDescriptionChar] = React.useState(maxDescriptionLength);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [isCollaborating, setIsCollaborating] = React.useState(false);
  const [collaborators, setCollaborators] = React.useState<string[]>([]);
  const [collaboratorDetails, setCollaboratorDetails] = React.useState<searchedUserDetail[]>([]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCollaborating(event.target.checked);
  };

  const [queryText, setQueryText] = React.useState('');
  const [startSearch, setStartSearch] = React.useState(false);

  const fetchData = async (): Promise<searchedUserDetail[]> => {

    const response = await axios.post('/api/user/search-collaborators', {
      queryText: queryText,
    });

    if (response.status !== 200) {
      throw new Error('Something went wrong, try again later');
    }

    setStartSearch(false);
    const data = response.data as searchedUserDetail[];
    return data;
  };

  const { data, status } = useQuery<searchedUserDetail[]>({
    queryKey: ['collaborators', queryText],
    queryFn: fetchData,
    enabled: startSearch && queryText.trim() !== '',
  });

  const searchedItems = data || [];

  const SearchedUsers = () => {

    if (status === 'pending' && startSearch) {
      return (
        <div className="w-full flex items-center justify-center py-5">
          <Loader2 className="animate-spin" />
        </div>
      );
    }

    if (status === 'error') {
      setQueryText('');
      
      return (
        <div className="w-full flex items-center justify-center py-5">
          <ErrorState message={`An error occurred while searching for "${queryText}"`} className='w-fit'/>
        </div>
      );
    }

    if (status === 'success' && searchedItems.length === 0) {
      setQueryText('');

      return (
        <div className="w-full flex items-center py-5">
          <EmptyState message={`No users found for "${queryText}"`} className='w-fit'/>
        </div>
      );
    }

    return (
      <div className="flex gap-3">
        <div className="flex flex-col flex-1">
          { searchedItems && searchedItems.length > 0 && searchedItems.map((item: searchedUserDetail) => (
              <CollaboratorCard key={item._id} detail={item} selector />
            ))}
        </div>
        { searchedItems && searchedItems.length > 0 && (
          <button type="button" onClick={() => {setQueryText(''); setStartSearch(false)}} className="size-7 md:size-8 -mt-2">
            <HugeiconsIcon icon={Cancel01Icon} className="size-5 md:size-6"/>
          </button>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setStartSearch(true);
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsLoading(true);
    const data = { image: file, uploadPreset: "nomeoBlogImages" };

    await uploadImage(data)
      .then((res) => {
        form.setValue("bannerImageUrl", res.secure_url);
        form.setValue("bannerImagePublicId", res.public_id);
        setUploadedImageUrl(res.secure_url);
        setIsLoading(false);
        setImageLoading(true);
      })
      .catch((err) => {
        toast.error("Error uploading image");
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleRemoveImage = () => {
    if (watchedBannerImageUrl && watchedBannerImagePublicId) {
      deleteCloudinaryImages(watchedBannerImagePublicId);
      setUploadedImageUrl(null);
      setPreviewImage(null);
      form.setValue("bannerImageUrl", "");
      form.setValue("bannerImagePublicId", "");
    }
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  React.useEffect(() => {
    setRemainingTitleChar(maxTitleLength - watchedTitle.trim().length);
  }, [watchedTitle, maxTitleLength]);

  React.useEffect(() => {
    setRemainingDescriptionChar(
      maxDescriptionLength - watchedDescription.trim().length
    );
  }, [watchedDescription, maxDescriptionLength]);

  const pathname = usePathname();

  const createBlog = async (data: createBlogValues) => {

    const fulldata = {...data, 
      read_time: readTime,
      path: pathname,
      collaborators: collaborators
    }

    try {
      setIsPublishing(true);
      await createNewBlog(fulldata).then((response) => {
        if (response.success && response.status === 200) {
          toast.success(response.message);
          setClearContent(true);
          setPreviewImage(null);
          form.reset();
          setCollaborators([]);
          setUploadedImageUrl(null);
          setCollaboratorDetails([]);
          queryClient.invalidateQueries({queryKey: ['blog-counts']})
          queryClient.invalidateQueries({queryKey: ['all-user-blogs']})
          router.push(`/${user.role === 'superAdmin' ? 'admin': user.role === 'creator' ? 'admin' : user.role}-dashboard/created-blogs`)
        }
        else {
          toast.error(response.message)
        }
        setIsPublishing(false)
      })
    } catch (error) {
      toast.error('Something went wrong, try again later')
    } finally {
      setIsPublishing(false);
    }
  };

  const createDraft = async () => {
    const data = form.getValues();

    if (!data.title) {
      form.setError('title', { message: 'Draft should have at least a title' });
      return;
    }

    if (!data.bannerImageUrl && !data.bannerImagePublicId) {
      form.setError('bannerImageUrl', { message: 'Banner image is required' });
      return;
    }

    const fulldata = {...data, 
      read_time: readTime,
      path: pathname,
      collaborators: collaborators
    }

    try {
      setIsSaving(true);
      await createNewDraft(fulldata).then((response) => {
        if (response.success && response.status === 200) {
          toast.success(response.message);
          setClearContent(true);
          setPreviewImage(null);
          form.reset();
          setCollaborators([]);
          setUploadedImageUrl(null);
          setCollaboratorDetails([]);
          queryClient.invalidateQueries({queryKey: ['blog-counts']})
          queryClient.invalidateQueries({queryKey: ['all-user-drafts']})
          router.push(`/${user.role === 'superAdmin' ? 'admin': user.role === 'creator' ? 'admin' : user.role}-dashboard/created-blogs/drafts`)
        }
        else {
          toast.error(response.message)
        }
        setIsSaving(false)
      })
    } catch (error) {
      toast.error('Something went wrong, try again later')
    } finally {
      setIsSaving(false);
    }
  };

  const addCollaborator = (userDetail:searchedUserDetail) => {
    if (collaborators.includes(userDetail._id)) {
      toast.error("User already added");
      return;
    } else {
      setCollaborators([...collaborators, userDetail._id]);
      setCollaboratorDetails([...collaboratorDetails, userDetail])
      setIsCollaborating(false)
    }
  };

  const removeCollaborator = (userId:string) => {
    const newCollaborators = collaborators.filter((id) => id !== userId);
    const newCollaboratorDetails = collaboratorDetails.filter((detail) => detail._id !== userId);
    setCollaboratorDetails(newCollaboratorDetails);
    setCollaborators(newCollaborators);
  };

  const CollaboratorCard = ({detail, selector}:{detail:searchedUserDetail, selector: boolean}) => {
    const { _id, email, surName, lastName, profilePicture } = detail;

    const alreadySelected = collaboratorDetails.find((item) => item._id === detail._id);
    return (
      <div className="flex items-center justify-between border-b p-2 last:border-0">
        <div className="flex gap-2 items-center">
          <div className="size-10 md:size-11 lg:size-12 rounded-full flex items-center justify-center relative">
            <Image src={profilePicture} alt="profile" fill className="object-cover object-center rounded-full" />
          </div>
          <div className="">
            <p className="text-sm lg:text-base">{surName + ' ' + lastName}</p>
            <p className="text-xs lg:text-sm text-gray-500">{email}</p>
          </div>
        </div>
        { selector ?
          <React.Fragment>
            { !alreadySelected &&
              <button className="flex items-center gap-2 md:p-2 p-1.5 md:px-4 px-3 rounded-full bg-black text-white text-sm" onClick={() => addCollaborator(detail)}>
                Select
              </button>
            }
          </React.Fragment> :
          <button className="flex items-center gap-2 md:p-2 p-1.5 md:px-4 px-3 rounded-full bg-black text-white text-sm" onClick={() => removeCollaborator(_id)}>
            Remove
          </button>
        }
      </div>
    )
  }

  return (
    <Form {...form}>
      <form  className="w-full flex-col flex gap-3 md:gap-4 md:w-[90%] xl:w-[80%] 2xl:w-[75%]"  onSubmit={form.handleSubmit(createBlog)}>
        <p className="w-full xl:text-xl md:text-lg line-clamp-1 px-2 text-ellipsis">
          {watchedTitle.trim().length > 0 ? watchedTitle : "New Blog"}
        </p>
        <div className="w-full">
          <div className="w-full rounded-lg xl:rounded-xl xl:h-[450px] md:h-[350px] lg:h-[400px] bg-[#d4d4d4] dark:bg-[#404040] aspect-video md:aspect-auto xl:mt-3 mt-2 relative overflow-hidden cursor-pointer">
            {previewImage && (
              <React.Fragment>
                <Image
                  src={previewImage}
                  alt="main_banner"
                  fill
                  className="object-cover object-center"
                />
              </React.Fragment>
            )}
            {uploadedImageUrl && (
              <React.Fragment>
                <Image
                  src={uploadedImageUrl}
                  alt="main_banner"
                  fill
                  className="object-cover object-center transition-opacity duration-500 opacity-0"
                  onLoadingComplete={(img) => {
                    img.classList.remove("opacity-0");
                    setImageLoading(false);
                    setPreviewImage(null);
                    toast.success("Image uploaded successfully");
                  }}
                />
                <button
                  type="button"
                  className="absolute top-4 right-4 z-[600] text-red-600 p-0.5 bg-red-200 rounded-md"
                  onClick={handleRemoveImage}
                >
                  <HugeiconsIcon icon={Delete01Icon} />
                </button>
              </React.Fragment>
            )}
            {isLoading || imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-white">
                <Loader2 className="animate-spin size-10 xl:size-12" />
              </div>
            )}
            {!uploadedImageUrl && !previewImage && !isLoading && (
              <React.Fragment>
                <label htmlFor="blog_banner" className="w-full cursor-pointer">
                  <Image
                    src={"/images/placeholder-image.png"}
                    alt="main_banner"
                    fill
                    className="object-cover object-center"
                  />
                  <input
                    hidden
                    type="file"
                    accept=".png, .jpeg, .jpg"
                    id="blog_banner"
                    onChange={handleImageFileChange}
                  />
                </label>
              </React.Fragment>
            )}
          </div>
          {form.formState.errors.bannerImageUrl && (
            <p className="text-red-600 text-[0.8rem] px-2 mt-2">
              {form.formState.errors.bannerImageUrl.message}
            </p>
          )}
        </div>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl className="-mb-3">
                <div>
                  <textarea
                    {...field}
                    placeholder="Enter the title of the blog..."
                    className="text-sm lg:text-base bg-[#d4d4d4] dark:bg-[#424242] w-full min-h-16 lg:min-h-20 outline-none resize-none leading-tight border mt-2 placeholder:text-black/60 placeholder:dark:text-white/80 rounded-lg p-2 md:p-2.5 disabled:bg-[#d4d4d4] disabled:border-0"
                    maxLength={100}
                    onKeyDown={handleOnKeyDown}
                  />
                </div>
              </FormControl>
              <div className="flex items-center justify-between">
                <FormMessage className="mt-0" />
                <p className="text-[0.8rem] text-right text-red-600 font-medium">
                  Remaing character: {remainingTitleChar}
                </p>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl className="-mb-2">
                <div>
                  <textarea
                    {...field}
                    placeholder="Give a summary of what your post is all about..."
                    className="text-sm lg:text-base bg-[#d4d4d4] dark:bg-[#424242] w-full min-h-32 md:min-h-32 lg:min-h-36 outline-none resize-none leading-tight border mt-2 placeholder:text-black/60 placeholder:dark:text-white/80 rounded-lg p-2 md:p-2.5 disabled:bg-[#d4d4d4] disabled:border-0"
                    maxLength={400}
                    onKeyDown={handleOnKeyDown}
                  />
                </div>
              </FormControl>
              <div className="flex items-center justify-between">
                <FormMessage className="mt-0" />
                <p className="text-[0.8rem] text-right text-red-600 font-medium">
                  Remaing character: {remainingDescriptionChar}
                </p>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl className="pt-3">
                <TipTap onChange={field.onChange} clearContent={clearContent} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 text-sm md:text-base">
            Do you wish to collaborate with someone?{" "}
            <input
              type="checkbox"
              id="collaborationCheckbox"
              checked={isCollaborating}
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="text-justify md:text-sm text-xs text-red-600">
            Note: You can only collaborate with maximum of two persons at a time and they still need to accept the invite inorder to take part in the draft. Only you can publish and delete and once you publish they cannot add to the content anymore.
          </div>
          { isCollaborating && (
            <div className="flex gap-3 flex-col mt-2 mb-4">
              <div className="flex gap-2">
                <InputWithIcon
                  icon={UserAdd01Icon}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  type="text"
                  placeholder="Enter email address or name of collaborator"
                  inputClassName="rounded-r-none text-sm lg:text-base bg-[#d4d4d4] dark:bg-[#424242] w-full outline-none resize-none leading-tight placeholder:text-black/60 placeholder:dark:text-white/80  disabled:bg-[#d4d4d4] disabled:border-0"
                />
                <button type="button" className="bg-black text-white p-2.5 rounded-lg text-sm lg:text-base md:w-[170px] rounded-l-none" onClick={() =>handleSubmit()}>
                  <span className="hidden md:block">Search</span>
                  <HugeiconsIcon icon={ArrowUpRight03Icon} className="rotate-45 md:hidden"/>
                </button>
              </div>
            </div>
          )}
          <SearchedUsers/>
          { collaboratorDetails && collaboratorDetails.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-base md:text-lg font-medium">Collaborators</p>
              {collaboratorDetails.map((detail) => (
                <CollaboratorCard key={detail._id} detail={detail} selector={false}/>
              ))}
            </div>
          )}
        </div>
        <div className="flex-none flex md:gap-4 justify-between w-full md:w-auto">
          <button className="text-sm lg:text-base xl:py-2.5 xl:px-6 md:py-2 md:px-5 py-2 px-4 rounded-full bg-secondary-blue dark:bg-secondary-blue hover:bg-black/60 text-white font-medium flex gap-2 items-center">
            {isPublishing ? "Publishing post..." : "Publish Post"}
            {isPublishing && (
              <Loader2 className="animate-spin xl:size-6 size-5" />
            )}
          </button>
          <button
            className="text-sm lg:text-base xl:py-2.5 xl:px-6 md:py-2 md:px-5 py-2 px-4 rounded-full bg-secondary-blue/30 dark:border-secondary-blue/70 dark:border dark:bg-inherit hover:bg-secondary-blue/70 font-medium flex items-center gap-2"
            type="button"
            onClick={createDraft}
          >
            {isSaving ? "Saving draft..." : "Save Draft"}
            {isSaving && <Loader2 className="animate-spin xl:size-6 size-5" />}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default CreateBlogForm;
