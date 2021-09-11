import { GREY_111, GREY_333, GREY_666 } from "../colour";
import { createNode, moveNode, node_render_function } from "../scene-node";

import { pushQuad } from "../draw";

const SEGMENT_GAP = 2;
const ENDS_PADDING = 2;
const SIDES_PADDING = 2;

const BACKGROUND_COLOUR = GREY_666;
const BAR_COLOUR = GREY_333;
const EMPTY_SEGMENT_COLOUR = GREY_111;
const BAR_HEIGHT = 16;

let node_bar_colour: number[] = [];
let node_bar_segment_width: number[] = [];
let node_bar_active_segments: number[] = [];
let node_bar_filled_segments: number[] = [];

export let createSegmentedBarNode = (parentId: number, x: number, y: number, segmentColour: number, segmentWidth: number, activeSegments: number, filledSegments: number): number =>
{
  let nodeId = createNode(parentId);
  node_render_function[nodeId] = renderSegmentedBar;

  moveNode(nodeId, x, y);

  node_bar_colour[nodeId] = segmentColour;
  node_bar_segment_width[nodeId] = segmentWidth;
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;

  return nodeId;
};

export let updateSegmentedBarNode = (nodeId: number, activeSegments: number, filledSegments: number): void =>
{
  node_bar_active_segments[nodeId] = activeSegments;
  node_bar_filled_segments[nodeId] = filledSegments;
};

let renderSegmentedBar = (nodeId: number, now: number, delta: number): void =>
{
  let activeSegments = node_bar_active_segments[nodeId];
  let filledSegments = node_bar_filled_segments[nodeId];
  let segmentColour = node_bar_colour[nodeId];
  let segmentWidth = node_bar_segment_width[nodeId];

  let segmentsLength = (activeSegments * segmentWidth) + ((activeSegments + 1) * SEGMENT_GAP) + (SIDES_PADDING * 2);
  pushQuad(0, 0, segmentsLength, BAR_HEIGHT, BACKGROUND_COLOUR);
  pushQuad(SIDES_PADDING, ENDS_PADDING, segmentsLength - SIDES_PADDING * 2, BAR_HEIGHT - ENDS_PADDING * 2, BAR_COLOUR);

  for (let i = 0; i < activeSegments; i++)
  {
    pushQuad(SIDES_PADDING + SEGMENT_GAP + ((segmentWidth + SEGMENT_GAP) * i), ENDS_PADDING * 2, segmentWidth, BAR_HEIGHT - ENDS_PADDING * 4, EMPTY_SEGMENT_COLOUR);
  }

  for (let i = 0; i < filledSegments; i++)
  {
    pushQuad(SIDES_PADDING + SEGMENT_GAP + ((segmentWidth + SEGMENT_GAP) * i), ENDS_PADDING * 2, segmentWidth, BAR_HEIGHT - ENDS_PADDING * 4, segmentColour);
  }
};