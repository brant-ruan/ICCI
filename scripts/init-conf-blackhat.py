#!/usr/bin/env python

import os

confs = {
    # 1997 ~ 2023
    'usa': [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004,
            2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
            2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
            2021, 2022, 2023],
    # 2003 ~ 2022 with 2000 ~ 2001
    'europe': [2000, 2001, 2003, 2004, 2005, 2006, 2007,
               2008, 2009, 2010, 2011, 2012, 2013, 2014,
               2015, 2016, 2017, 2018, 2019, 2020, 2021,
               2022],
    # 2014 ~ 2023, 2000 ~ 2008
    'asia': [2000, 2001, 2002, 2003, 2004, 2005, 2006,
             2007, 2008, 2014, 2015, 2016, 2017, 2018,
             2019, 2020, 2021, 2022, 2023],
}

for loc in confs:
    for year in confs[loc]:
        os.system(f'mkdir -p ../conferences/{year}/blackhat/{loc}')
        os.system(f'touch ../conferences/{year}/blackhat/{loc}/content.json')
