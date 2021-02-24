SHELL=/bin/bash
45 7 * * * ec2-user ~/stop_backup_start.sh > ~/cron_backup.log
# * * * * * USER COMMAND
# - - - - -
# | | | | |
# | | | | ----- Day of week (0 - 7) (Sunday=0 or 7)
# | | | ------- Month (1 - 12)
# | | --------- Day of month (1 - 31)
# | ----------- Hour (0 - 23)
# ------------- Minute (0 - 59)