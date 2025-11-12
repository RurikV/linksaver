FROM node:20.12.0-alpine

# Create app directory
WORKDIR '/usr/app'

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json .
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 7777

# Start
CMD ["npm", "start"]