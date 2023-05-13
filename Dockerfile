FROM centos
WORKDIR /opt/hc
COPY ./guradian-notify .
RUN chmod +x guradian-notify
EXPOSE 8000
CMD ["./guradian-notify"]
