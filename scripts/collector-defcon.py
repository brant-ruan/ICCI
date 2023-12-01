#!/usr/bin/env python

import requests
from bs4 import BeautifulSoup
import sys

base_url = "https://media.defcon.org/DEF CON {num}/DEF CON 31 video and slides/"


def year_to_num(year):
    return int(year) - 1992


def get_talk_list(year):
    num = year_to_num(year)
    res = list()
    url = base_url.format(num=num)
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")
    links = soup.find_all("a")
    titles = [link.get("title") for link in links]
    for title in titles:
        if not title:
            continue
        if not title.startswith(f"DEF CON {num} -"):
            continue
        res.append(title)
    res = [title.replace(f"DEF CON {num} - ", "") for title in res]
    # DO NOT REMOVE other dot in title. For example:
    # old: Changing Advances in Windows Shellcode Analysis - Dr. Bramwell Brizendine, Max - Libra - Kersten, Jake Hince.mp4
    # new: Changing Advances in Windows Shellcode Analysis - Dr. Bramwell Brizendine, Max - Libra - Kersten, Jake Hince
    # remove suffix (only consider .mp4, .pdf, .srt) with regex
    res = [title.replace(".mp4", "") for title in res]
    res = [title.replace(".pdf", "") for title in res]
    res = [title.replace(".srt", "") for title in res]


    return res


if __name__ == "__main__":
    year = sys.argv[1]
    for talk in get_talk_list(year):
        print(talk)
