"use strict";

const StoryFilter = Object.freeze({
  ALL: "ALL",
  FAVORITES: 'FAVORITES',
  MY_STORIES: "MY_STORIES"
});

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  console.log(storyList);
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, ownStory=false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const favoriteStoryIds = currentUser.favorites.map(story => story.storyId);
  const favoriteImg = favoriteStoryIds.includes(story.storyId) ? "./favorite-filled.png" : "./favorite-outline.png";
  return $(`
      <li id="${story.storyId}" ${ownStory ? "style='list-style-type:none'" : ""}>
        <div style="display: flex;">
          ${ownStory ? "<i class='fas fa-trash-alt delete-icon'></i>" : ""}
          <img class="favorite-icon" src="${favoriteImg}" />
          <div style="margin-left:10px">
            <a href="${story.url}" target="a_blank" class="story-link">
              ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </div>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(storyFilter) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  let storiesToRender;
  if (storyFilter == StoryFilter.FAVORITES) {
    storiesToRender = currentUser.favorites;
  } else if (storyFilter == StoryFilter.MY_STORIES) {
    storiesToRender = currentUser.ownStories.toReversed();
  } else {
    storiesToRender = storyList.stories;
  }
  console.log(storiesToRender);
  for (let story of storiesToRender) {
    const $story = generateStoryMarkup(story, storyFilter == StoryFilter.MY_STORIES);
    $allStoriesList.append($story);
  }

  $(".favorite-icon").on('click', async function(evt) {
    console.log("favoriting story...")
    const storyId = $(this).parent().attr('id');
    const isStoryFavorited = currentUser.favorites.map(story => story.storyId).includes(storyId);
    const newImgSrc = isStoryFavorited ? './favorite-outline.png' : './favorite-filled.png';
    $(this).attr('src', newImgSrc);
    console.log($(this))
    await currentUser.favoriteStory(storyId, !isStoryFavorited);
    if (storyFilter == StoryFilter.FAVORITES || storyFilter == StoryFilter.MY_STORIES) {
      putStoriesOnPage(storyFilter);
    } else {
      getAndShowStoriesOnStart();
    }
  });

  $(".delete-icon").on('click', async function(evt) {
    console.log("deleting story...")
    console.log($(this))
    const storyId = $(this).parent().attr('id');
    console.log(storyId);
    await currentUser.deleteStory(storyId, currentUser);
    putStoriesOnPage(storyFilter);
  });

  $allStoriesList.show();
}

/** Submits a new story */

async function submitStory(evt) {
  console.log("submitStory")
  evt.preventDefault();
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();  

  await storyList.addStory(currentUser, {title, author, url});
  getAndShowStoriesOnStart();
}

$("#story-form").on('submit', submitStory);
