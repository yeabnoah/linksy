"use client";

import { AddContentFolderModal } from "@/components/add-content-folder";
import { NoteCard } from "@/components/note-card";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ShareModalFolder } from "@/components/share-modal-folder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import folderInterface from "@/interface/folder_interface";
import { authClient } from "@/lib/auth-client";
import useSingleFoldersStore from "@/state/singleFolderStore";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Edit,
  Loader,
  MoreHorizontal,
  MoveLeftIcon,
  PlusIcon,
  Search,
  Share2Icon,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const FILTERS = [
  { label: "All-Types", value: "all" },
  { label: "Telegram", value: "telegram" },
  { label: "Twitter", value: "twitter" },
  { label: "Instagram", value: "instagram" },
  { label: "Youtube", value: "youtube" },
  { label: "Reddit", value: "reddit" },
  { label: "Discord", value: "discord" },
  { label: "Pinterest", value: "pinterest" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Website", value: "website" },
];

export default function Folder({ params }: { params: { id: string } }) {
  const id = params.id;
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { singleFolder, setSingleFolder } = useSingleFoldersStore();
  const session = authClient.useSession();

  const router = useRouter();
  const queryClient = useQueryClient();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!session.data?.session) {
    redirect("/landing");
  }

  useEffect(() => {
    if (singleFolder) {
      setNewFolderName(singleFolder.name);
    }
  }, [singleFolder]);

  const handleEditFolder = async () => {
    if (!newFolderName) {
      toast.error("Please enter a folder name");
      return;
    }
    try {
      await axios.patch(
        `/api/v1/folder/${id}`,
        { name: newFolderName },
        { withCredentials: true }
      );
      toast.success("Folder updated successfully!");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Failed to update folder:", error);
      toast.error("Failed to update folder. Please try again.");
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await axios.delete(`/api/v1/folder/${id}`, { withCredentials: true });
      toast.success("Folder deleted successfully!");
      setIsDeleteModalOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Failed to delete folder. Please try again.");
    }
  };

  const user = {
    name: session.data?.user ? (session.data?.user.name as string) : "",
    email: session.data?.user ? (session.data?.user.email as string) : "",
    image: session.data?.user ? (session.data?.user.image as string) : "",
  };

  const { isLoading, isError, error } = useQuery({
    queryKey: ["repoData", id],
    queryFn: async () => {
      const response = (await axios.get(`/api/v1/folder/${id}`, {
        withCredentials: true,
      })) as {
        data: { data: folderInterface };
      };
      setSingleFolder(response.data.data);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    retry: 1,
  });

  const filteredContent = singleFolder?.content.filter((bookmark) => {
    if (selectedFilter === "all" && !searchQuery) return true; // Show all items
    if (
      selectedFilter !== "all" &&
      selectedFilter &&
      bookmark.type !== selectedFilter
    )
      return false;
    if (searchQuery) {
      return (
        bookmark.tags
          .toLocaleString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bookmark.description &&
          bookmark?.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin" />
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="p-4">
          <p className="text-red-500">
            Error loading data: {(error as Error).message}
          </p>
        </Card>
      );
    }

    if (!filteredContent || filteredContent.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="empty-state text-center p-8"
        >
          <p className="text-xl text-gray-500">
            No bookmarks found. Add some to get started!
          </p>
          <Button
            onClick={() => setIsAddContentModalOpen(true)}
            className="mt-4"
          >
            Add Your First Bookmark
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="bookmarks"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className=" flex md:flex-row flex-col mx-auto w-full gap-5 md:flex-wrap"
      >
        {filteredContent.map((bookmark) => (
          <NoteCard
            id={bookmark.id}
            key={bookmark.id}
            title={bookmark.title}
            description={(bookmark.description as string) || ""}
            link={bookmark.link}
            tags={bookmark.tags}
            type={bookmark.type}
          />
        ))}
      </motion.div>
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {}, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:py-8 py-5 sm:px-6 ">
      <div className="flex flex-row justify-between items-center mb-8 gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-background rounded-full" />
          </div>
          <span className="font-semibold text-lg md:text-xl text-foreground">
            Linksy
          </span>
        </Link>
        <div className="flex items-center space-x-3">
          <Button
            className="font-medium flex items-center justify-center text-center transition-all duration-200 ease-in-out hover:scale-105"
            onClick={() => {
              setIsShareModalOpen(!isShareModalOpen);
            }}
          >
            <Share2Icon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <ProfileDropdown user={user} />
        </div>
      </div>

      <div className="flex flex-row justify-between items-start sm:items-center my-5 gap-4">
        <div className="flex items-center gap-2 sm:gap-5">
          <Button
            onClick={() => router.back()}
            className="bg-transparent shadow-none hover:bg-gray-100 transition-colors"
          >
            <MoveLeftIcon className="text-black text-xl font-bold" />
          </Button>
          <h2 className="text-lg md:text-2xl font-normal md:font-semibold">
            {singleFolder?.name || "Loading..."} Folder
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddContentModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Content</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 mb-6">
        <div className="relative flex-grow w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search Bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-64 placeholder:text-sm"
          />
          <Search className="absolute h-5 w-5 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>{renderContent()}</div>

      <AddContentFolderModal
        isOpen={isAddContentModalOpen}
        onClose={() => setIsAddContentModalOpen(false)}
      />

      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 " />
          <Dialog.Content className="fixed bg-white p-6 shadow-lg rounded-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Edit Folder
            </Dialog.Title>
            <Dialog.Description className="text-gray-500 mb-4">
              Enter a new name for the folder.
            </Dialog.Description>
            <Input
              className="mb-4"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleEditFolder}>Save</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed bg-white p-6 shadow-lg rounded-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Delete Folder
            </Dialog.Title>
            <Dialog.Description className="text-gray-500 mb-4">
              Are you sure you want to delete this folder?
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleDeleteFolder} variant="destructive">
                Delete
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ShareModalFolder
        itemCount={filteredContent.length}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
