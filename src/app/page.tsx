/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, SetStateAction, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from '@/components/ui/themetoggle';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {  Pagination,  PaginationContent,  PaginationEllipsis,  PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {  Dialog,  DialogTrigger,  DialogContent,  DialogHeader,  DialogTitle,  DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";

import { LoaderCircle, Calendar, Search, BookText, TvMinimalPlay, Trophy, Clock, CirclePlay, Star, Clapperboard, Video, UserRoundPenIcon } from "lucide-react";
import { Play } from 'next/font/google';

export default function AnimeLibrary() {
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"anime" | "manga">("anime");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Function to handle search
  const searchAnimeAndManga = async () => {
    if (query.trim() === "") return;
    setLoading(true);
    try {
      const [animeRes, mangaRes] = await Promise.all([
        fetch(`https://api.jikan.moe/v4/anime?q=${query}`),
        fetch(`https://api.jikan.moe/v4/manga?q=${query}`)
      ]);
      const animeData = await animeRes.json();
      const mangaData = await mangaRes.json();

      // Ensure each item has a unique key by appending a unique suffix if needed
      const animeResults = animeData.data.map((anime: { mal_id: any; }, index: any) => ({
        ...anime,
        uniqueKey: `${anime.mal_id}-${index}`,
      }));

      const mangaResults = mangaData.data.map((manga: { mal_id: any; }, index: any) => ({
        ...manga,
        uniqueKey: `${manga.mal_id}-${index}`,
      }));

      const combinedResults = [...animeResults, ...mangaResults];
      setResults(combinedResults);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching anime:", error);
    } finally {
      setLoading(false);
    }
  };
    
  // Get top anime on initial load
  const getTopAnime = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.jikan.moe/v4/top/anime");
      const data = await res.json();
      const uniqueResults = data.data.map((anime: { anime_id: any; }, index: any) => ({
        ...anime,
        uniqueKey: `${anime.anime_id}-${index}`,
      }));
      setResults(uniqueResults);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching top anime:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopAnime();
  }, []); 

  useEffect(() => {
    if (query.trim() === "") {
      getTopAnime();
    }
  }, [query]);

  // Function to get top manga
  const getManga = async () => {
    setQuery("");
    setLoading(true);
    try {
      const res = await fetch("https://api.jikan.moe/v4/top/manga");
      const data = await res.json();
      const uniqueResults = data.data.map((manga: { manga_id: any; }, index: any) => ({
        ...manga,
        uniqueKey: `${manga.manga_id}-${index}`,
      }));
      setResults(uniqueResults);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching top manga:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get seasonal anime
  const getSeasonalAnime = async () => {
    setQuery("");
    setLoading(true);
    try {
      const res = await fetch("https://api.jikan.moe/v4/seasons/now");
      const data = await res.json();
      const uniqueResults = data.data.map((anime: { mal_id: any; }, index: any) => ({
        ...anime,
        uniqueKey: `${anime.mal_id}-${index}`,
      }));
      setResults(uniqueResults);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching seasonal anime:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyDown = (e: { key: string; }) => {
    if (e.key === "Enter") {
      searchAnimeAndManga();
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const handlePageChange = (pageNumber: SetStateAction<number>) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="max-w-6xl mx-auto p-6 pb-16">
      <div className="w-full flex flex-col lg:flex-row justify-between mb-12">
        <div className="flex flex-col items-center lg:items-start pb-4">
          <h1 className="text-3xl font-bold cursor-pointer" onClick={() => router.push("/")}>AniKōji</h1>
          <p className="text-sm text-muted-foreground mt-1">A small curated anime/manga directory.</p>
        </div>
        
        <div className="flex gap-2 flex-col lg:flex-row items-start">
          <div className="w-full flex flex-row gap-2"> 
            <Input
              placeholder="Search for an anime or manga..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full lg:w-md"
            />

            <Button className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer" onClick={searchAnimeAndManga} disabled={loading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-full flex flex-row gap-2 justify-center">
            <Button className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer" onClick={getSeasonalAnime} disabled={loading}>
              <TvMinimalPlay className="w-4 h-4" /> Seasonal Anime
            </Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer" onClick={getManga} disabled={loading}>
              <BookText className="w-4 h-4" /> Browse Manga
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="animate-spin h-8 w-8 text-gray-500"></LoaderCircle>
        </div>
      ) : (
        <>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-4"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
            >
            {currentItems.map((item) => (
              <motion.div
                key={item.uniqueKey}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}>

                <Dialog key={item.uniqueKey}>
                  <DialogTrigger asChild>
                      <Card className="h-full cursor-pointer rounded-2xl shadow-sm">
                        <CardContent className="flex flex-col items-center">
                          <div className="relative w-full">
                            <Image
                              src={item.images.jpg.image_url}
                              alt={item.title}
                              width={400}
                              height={192}
                              className="w-full h-[420] object-cover rounded-t-lg"
                              unoptimized
                            />

                            <div className="flex flex-col items-start">
                                <Badge variant="secondary" className="bg-indigo-500 text-white absolute top-2 right-2 z-10">
                                  <Star className="text-amber-400 fill-amber-400 w-6 h-6" />{item.score ?? "N/A"}
                                </Badge>
                            </div>
                              <div className="flex flex-col items-start">
                                <Badge variant="secondary" className="absolute bottom-2 left-2 z-10 bg-indigo-500 text-white">
                                  {item.type === "Manga" ? "Manga" : "Anime"}
                                </Badge>
                                <Badge variant="secondary" className="absolute bottom-10 left-2 z-10 bg-indigo-500 text-white">
                                  {item.status}
                                </Badge>
                              </div>
                          </div>
                            
                          <div className="w-full flex flex-col items-start px-4 py-6">
                            <h2 className="text-lg font-semibold pb-2">{item.title}</h2>
                            <p className="text-sm text-muted-foreground">
                              {item.type === "Manga"
                              ? item.published?.from?.split?.("-")?.[0] ?? "Unknown"
                              : item.aired?.prop?.from?.year ?? "Unknown"}
                            </p>
                          </div>
                        </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-h-[80vh] p-12">
                    <DialogHeader>
                      <DialogTitle>{item.title}</DialogTitle>
                      <DialogDescription>
                        <div className="text-sm text-muted-foreground italic mb-2">
                          {item.type === "Manga" ? item.japanese : item.title_japanese}
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                      <section className="w-full py-4">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="relative w-full md:w-1/3">
                              <Image
                                src={item.images.jpg.image_url}
                                alt={item.title}
                                width={500}
                                height={700}
                                className="rounded-xl w-full h-auto object-cover"
                                unoptimized
                              />
                                <Badge variant="secondary" className="absolute top-2 left-2 z-10 bg-indigo-500 text-white">
                                    {item.type === "Manga" ? "Manga" : "Anime"}
                                </Badge>
                            </div>
                    
                            <div className="w-full md:w-2/3 space-y-3">
                              <h1 className="text-3xl font-bold">{item.title}</h1>
                              <div className="flex flex-row gap-2">
                                <Badge variant="secondary" className="bg-indigo-500 text-white">
                                  <Star className="text-amber-400 fill-amber-400 w-6 h-6" />{item.score ?? ""}
                                </Badge>
                                {item.status === "Finished Airing" 
                                ? (
                                  <Badge variant="destructive" className="bg-indigo-500 text-white">
                                    {item.status}
                                  </Badge>
                                ) : ( 
                                  <Badge variant="secondary" className="bg-indigo-500 text-white">
                                    {item.status}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="bg-indigo-500 text-white">
                                  {item.type === "Manga"
                                    ? item.published?.from?.split?.("-")?.[0] ?? "Unknown"
                                    : item.aired?.prop?.from?.year ?? "Unknown"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex gap-2 p-4 bg-muted-foreground/10 rounded-md items-start">
                                  <Calendar className="mt-0.75 w-6 h-6 text-indigo-500" />
                                  <div className="flex flex-col">
                                    <h4 className="text-md font-medium">
                                      {item.type === "Manga" ? "Published" : "Aired"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {item.type === "Manga" ? item.published?.string : item.aired?.string ?? ""}
                                    </p>
                                  </div>
                                </div>
                                    
                               <div className="flex gap-2 p-4 bg-muted-foreground/10 rounded-md items-start">
                                  <Trophy className="mt-0.75 w-6 h-6 text-indigo-500" />
                                  <div className="flex flex-col">
                                    <h4 className="text-md font-medium">
                                      Rank
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {item.rank ?? "N/A"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex gap-2 p-4 bg-muted-foreground/10 rounded-md items-start">
                                  {item.type === "Manga" ? 
                                    <BookText className="mt-0.75 w-6 h-6 text-indigo-500" /> 
                                    : <Clock className="mt-0.75 w-6 h-6 text-indigo-500" />}
                                  <div className="flex flex-col">
                                    <h4 className="text-md font-medium">
                                      {item.type === "Manga" ? "Chapters" : "Duration"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {item.type === "Manga" ? item.chapters ?? "" : item.duration ?? ""}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex gap-2 p-4 bg-muted-foreground/10 rounded-md items-start">
                                {item.type === "Manga" ?
                                  <BookText className="mt-0.75 w-6 h-6 text-indigo-500" />
                                  : <CirclePlay className="mt-0.75 w-6 h-6 text-indigo-500" />}
                                  <div className="flex flex-col">
                                    <h4 className="text-md font-medium">
                                      {item.type === "Manga" ? "Volumes" : "Episodes"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {item.type === "Manga" ? item.volumes ?? "" : item.episodes ?? ""}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full">
                            {item.synopsis && (
                                <div className="py-4">
                                  <h2 className="text-xl font-semibold mb-1">Synopsis</h2>
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.synopsis}
                                  </p>
                                </div>
                              )}
                          </div>

                          <div className="w-full flex flex-col gap-2">
                            <div className="flex flex-row items-start gap-2">
                              <Clapperboard className="w-4 h-4" />
                              <p className="text-sm text-muted-foreground">
                                {item.studios?.map((studio: { name: any; }) => studio.name).join(", ") ?? ""}
                              </p> 
                            </div>

                            <div className="flex flex-row items-start gap-2">
                              <UserRoundPenIcon className="w-4 h-4" />
                              <p className="text-sm text-muted-foreground">
                                {item.producers?.map((producer: { name: any; }) => producer.name).join(", ") ?? ""}
                              </p> 
                            </div>
                            
                          </div>
                        </section>
                    </DialogContent>
                </Dialog>
                  
                
              </motion.div>

            ))}
          </motion.div>
          
          <Pagination>
            <PaginationContent>
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={page === currentPage ? "bg-indigo-500 text-white" : ""}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Ellipsis - Optional: Add if you want, or omit */}
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </>
        )}
    </section>
  );
}


