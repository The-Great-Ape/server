FROM nginx:latest

RUN rm -rf /etc/nginx/sites-enabled/default
RUN rm -rf /etc/nginx/conf.d/default.conf
RUN cp /home/client/build /app/client
# ADD nginx.conf /etc/nginx/nginx.conf
