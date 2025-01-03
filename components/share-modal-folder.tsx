"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import dataComingFolderShare from "@/interface/dataIncoming";
import useSingleFoldersStore from "@/state/singleFolderStore";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Lock, Share2, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemCount: number;
}

export function ShareModalFolder({
  isOpen,
  onClose,
  itemCount,
}: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [shareHash, setShareHash] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { singleFolder } = useSingleFoldersStore();

  useEffect(() => {
    const fetchShareData = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `/api/v1/folder/share?folderId=${singleFolder.id}`,
            {
              withCredentials: true,
            }
          );
          const data = response.data as dataComingFolderShare;
          if (data.data.hash) {
            setShareHash(data.data.hash);
            setAllowed(data.data.allowed);
            setLink(`${window.location.origin}/share/folder/${data.data.hash}`);
          }
        } catch (error) {
          toast.error(`Failed to fetch sharing data. : ${error}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchShareData();
  }, [isOpen, singleFolder.id]);

  const handleStopSharing = async () => {
    try {
      await axios.post(
        "/api/v1/folder/share",
        {
          id: singleFolder.id,
          share: false,
        },
        { withCredentials: true }
      );
      toast.success("Sharing disabled successfully");
      setAllowed(false);
      setShareHash(null);
      setLink("");
    } catch (error) {
      toast.error(`An error occurred while disabling sharing. : ${error}`);
    }
  };

  const handleStartSharing = async () => {
    try {
      const response = await axios.post(
        "/api/v1/folder/share",
        {
          id: singleFolder.id,
          share: true,
        },
        { withCredentials: true }
      );
      const data = response.data as dataComingFolderShare;
      if (data.data.hash) {
        toast.success("Sharing enabled successfully");
        setShareHash(data.data.hash);
        setLink(`${window.location.origin}/share/folder/${data.data.hash}`);
        setAllowed(true);
      } else {
        toast.error("Sharing enabled, but no hash received.");
      }
    } catch (error) {
      toast.error(`An error occurred while enabling sharing.: ${error}`);
    }
  };

  const handleCopyLink = async () => {
    if (shareHash) {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] rounded-md md:max-w-xl flex-wrap flex p-0 mx-auto md:mx-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight dark:text-white">
                Share Your Folder with the link collection
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed dark:text-gray-300">
                Share your entire collection of bookmarks inside of your folder.
                They&apos;ll be able to see all your bookmarks.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center py-4"
              >
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </motion.div>
            ) : allowed && shareHash ? (
              <motion.div
                key="share-link"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 rounded-lg bg-muted p-3 text-sm dark:bg-gray-700">
                  <Share2 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  <Input
                    readOnly
                    value={link}
                    className="flex-1 bg-transparent border-none focus:outline-none dark:text-white"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1 font-medium"
                    onClick={handleStopSharing}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Stop Sharing
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 font-medium dark:bg-gray-700 dark:text-white"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {isCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="start-sharing"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="w-full font-medium bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 dark:text-white"
                  onClick={handleStartSharing}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Start Sharing
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center text-sm text-muted-foreground dark:text-gray-400">
            {itemCount} {itemCount === 1 ? "item" : "items"} will be shared.
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
