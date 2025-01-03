"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { queryClient } from "@/util/query-client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLinkIcon,
  InstagramIcon,
  MessageSquareIcon,
  Trash2,
  TwitterIcon,
  YoutubeIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  FacebookEmbed,
  InstagramEmbed,
  LinkedInEmbed,
  PlaceholderEmbed,
  TikTokEmbed,
  XEmbed,
  YouTubeEmbed,
} from "react-social-media-embed";
import RedditEmbed from "./redditEmbed";
import TelegramPost from "./telegramEmbed";

interface NoteCardProps {
  id: number;
  title: string;
  tags: string[];
  type: string;
  description: string;
  link: string;
}

const typeIcons = {
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  telegram: MessageSquareIcon,
  instagram: InstagramIcon,
};

export function NoteCard({
  id,
  title,
  link,
  tags,
  type,
  description,
}: NoteCardProps) {
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/v1/content/${id}`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Note deleted successfully!");
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete the note.");
    },
  });

  const handleDelete = () => {
    deleteNoteMutation.mutate(id);
  };

  const TypeIcon = typeIcons[type as keyof typeof typeIcons];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-fit w-[90vw] mx-auto md:w-[24vw] max-w-sm shadow-lg">
        <CardHeader className="flex items-center flex-row justify-between space-y-0 pb-2 bg-primary/5">
          <div className="flex items-center gap-3">
            {TypeIcon && <TypeIcon className="text-primary w-5 h-5" />}
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDelete}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete note</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-center border rounded-md bg-background overflow-hidden h-[8rem]">
            {type === "twitter" && (
              <XEmbed url={link} className="w-full rounded-md" />
            )}
            {type === "youtube" && (
              <YouTubeEmbed url={link} className="w-full rounded-md" />
            )}
            {type === "instagram" && (
              <InstagramEmbed url={link} className="w-full rounded-md" />
            )}
            {type === "telegram" && (
              <TelegramPost type="telegram" link={link} />
            )}
            {type === "reddit" && <RedditEmbed postUrl={link} />}
            {type === "discord" && (
              <PlaceholderEmbed
                url={link}
                imageUrl="/Discord.avif"
                spinnerDisabled={true}
                allowJavaScriptUrls={false}
              />
            )}
            {type === "linkedin" && (
              <LinkedInEmbed
                url="https://www.linkedin.com/embed/feed/update/urn:li:share:6898694772484112384"
                postUrl={link}
              />
            )}
            {type === "pinterest" && (
              <PlaceholderEmbed
                url={link}
                imageUrl="/pinterest.png"
                spinnerDisabled={true}
                allowJavaScriptUrls={false}
              />
            )}
            {type === "tiktok" && <TikTokEmbed url={link} />}
            {type === "facebook" && <FacebookEmbed url={link} />}
          </div>
          <AnimatePresence>
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {description}
            </motion.p>
          </AnimatePresence>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    <ExternalLinkIcon className="w-5 h-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open original link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
